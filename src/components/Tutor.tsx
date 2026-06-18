"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import ScenarioPicker from "@/components/ScenarioPicker";
import type {
  Feedback,
  Scenario,
  Stage,
  StudentIdentity,
  TranscriptTurn,
} from "@/types";
import { RATING_BANDS, CATEGORIES } from "@/lib/categories";
import type { Rating, CategoryId } from "@/lib/categories";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOTAL_STAGES = 3;

export default function Tutor({ scenarios }: { scenarios: Scenario[] }) {
  const [stage, setStage] = useState<Stage>("pick");
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [currentStage, setCurrentStage] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [apiError, setApiError] = useState("");
  const [identity, setIdentity] = useState<StudentIdentity | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [formError, setFormError] = useState("");

  const transcriptRef = useRef<TranscriptTurn[]>([]);
  const tts = useSpeechSynthesis();
  const sr = useSpeechRecognition();

  const handlePickScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setStage("welcome");
  };

  const handleBackToPicker = () => {
    tts.stopSpeaking();
    setStage("pick");
  };

  const handleStart = () => {
    if (!selectedScenario) return;
    const name = nameInput.trim();
    const email = emailInput.trim();
    if (!name) {
      setFormError("Please enter your name.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    setFormError("");
    setIdentity({ name, email });
    transcriptRef.current = [];

    const firstStage = selectedScenario.stages[0];
    setCurrentStage(1);
    setCurrentQuestion(firstStage.openingQuestion);
    setCurrentTitle(firstStage.title);
    setStage("intro");
    tts.speak(selectedScenario.introSpoken, () => {
      setStage("ready");
      tts.speak(firstStage.openingQuestion);
    });
  };

  const handleSkipIntro = () => {
    tts.stopSpeaking();
    setStage("ready");
  };

  const goToScoring = useCallback(
    async (fullTranscript: TranscriptTurn[]) => {
      if (!selectedScenario || !identity) return;
      setStage("processing");
      setApiError("");
      try {
        const response = await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenarioId: selectedScenario.id,
            transcript: fullTranscript,
            studentName: identity.name,
            studentEmail: identity.email,
          }),
        });
        if (!response.ok) {
          const errData = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));
          throw new Error(errData.error || `Request failed with ${response.status}`);
        }
        const data = (await response.json()) as { feedback: Feedback };
        setFeedback(data.feedback);
        setStage("scorecard");
        if (data.feedback.student.spokenSummary) {
          tts.speak(data.feedback.student.spokenSummary);
        }

        fetch("/api/save-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenarioId: selectedScenario.id,
            scenarioSubject: selectedScenario.subject,
            scenarioTopic: selectedScenario.topic,
            studentName: identity.name,
            studentEmail: identity.email,
            transcript: fullTranscript,
            feedback: data.feedback,
          }),
        }).catch((err) => console.error("Save session failed:", err));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setApiError(`Could not generate your scorecard. ${message}`);
        setStage("ready");
      }
    },
    [selectedScenario, identity, tts],
  );

  const goToNextStage = useCallback(
    async (nextStage: number, fullTranscript: TranscriptTurn[]) => {
      if (!selectedScenario) return;
      setStage("processing");
      setApiError("");
      try {
        const response = await fetch("/api/next-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenarioId: selectedScenario.id,
            nextStage,
            transcript: fullTranscript,
          }),
        });
        if (!response.ok) {
          const errData = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));
          throw new Error(errData.error || `Request failed with ${response.status}`);
        }
        const data = (await response.json()) as {
          question: string;
          title: string;
          stage: number;
        };
        setCurrentStage(nextStage);
        setCurrentQuestion(data.question);
        setCurrentTitle(data.title);
        setStage("ready");
        tts.speak(data.question);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setApiError(`Could not continue the assessment. ${message}`);
        setStage("ready");
      }
    },
    [selectedScenario, tts],
  );

  const submitStageAnswer = useCallback(
    (answer: string) => {
      const turn: TranscriptTurn = {
        stage: currentStage,
        title: currentTitle,
        question: currentQuestion,
        answer,
      };
      const updated = [...transcriptRef.current, turn];
      transcriptRef.current = updated;

      if (currentStage < TOTAL_STAGES) {
        goToNextStage(currentStage + 1, updated);
      } else {
        goToScoring(updated);
      }
    },
    [currentStage, currentTitle, currentQuestion, goToNextStage, goToScoring],
  );

  const handleRecord = () => {
    if (sr.listening) {
      const final = sr.stop();
      const usable =
        final && final.length >= 5
          ? final
          : sr.interim && sr.interim.length >= 5
            ? sr.interim
            : "";
      if (!usable) {
        setApiError("I didn't catch that. Tap the microphone and try again.");
        setStage("ready");
        return;
      }
      setApiError("");
      submitStageAnswer(usable);
    } else {
      tts.stopSpeaking();
      setApiError("");
      sr.start();
      setStage("listening");
    }
  };

  const handleReplayQuestion = () => {
    if (currentQuestion) tts.speak(currentQuestion);
  };

  const handleFullReset = useCallback(() => {
    tts.stopSpeaking();
    sr.hardReset();
    transcriptRef.current = [];
    setFeedback(null);
    setApiError("");
    setIdentity(null);
    setNameInput("");
    setEmailInput("");
    setSelectedScenario(null);
    setCurrentStage(1);
    setCurrentQuestion("");
    setCurrentTitle("");
    setStage("pick");
  }, [tts, sr]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleFullReset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleFullReset]);

  if (stage === "pick") {
    return <ScenarioPicker scenarios={scenarios} onPick={handlePickScenario} />;
  }

  if (!selectedScenario) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <header className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold bg-brand">
            I
          </div>
          <div>
            <div className="font-display font-semibold text-slate-900 text-sm">
              Interviewa Tutor
            </div>
            <div className="text-xs text-slate-500">
              {selectedScenario.subject} - {selectedScenario.topic}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {identity && (
            <div className="text-slate-600">
              <span className="font-semibold">{identity.name}</span>
            </div>
          )}
          {(stage === "ready" || stage === "listening" || stage === "processing") && (
            <div className="px-2.5 py-1 rounded-full bg-blue-50 text-brand font-semibold">
              Stage {currentStage} of {TOTAL_STAGES}
            </div>
          )}
          <button
            onClick={handleFullReset}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
            title="Start over"
          >
            Restart
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 flex flex-col bg-slate-900 text-white p-8 overflow-y-auto">
          <div className="flex items-center gap-4 mb-8">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg bg-brand ${tts.speaking ? "animate-speak-pulse" : ""}`}
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
            </div>
            <div>
              <div className="font-display font-semibold text-lg">Your AI Assessor</div>
              <div className="text-sm text-slate-400">
                {tts.speaking
                  ? "Speaking..."
                  : sr.listening
                    ? "Listening..."
                    : stage === "processing"
                      ? "Thinking..."
                      : "Ready"}
              </div>
            </div>
          </div>

          {stage === "welcome" && (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-full max-w-md">
                <h1 className="font-display text-3xl font-bold mb-3 text-center">
                  Ready when you are.
                </h1>
                <p className="text-slate-300 mb-8 text-center">
                  This is a three stage assessment. Enter your details to begin.
                  Your responses will be saved so your tutor can review them.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                      Your name
                    </label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => {
                        setNameInput(e.target.value);
                        setFormError("");
                      }}
                      placeholder="Lee Nazari"
                      className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                      Your email
                    </label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        setFormError("");
                      }}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleStart();
                      }}
                    />
                  </div>

                  {formError && (
                    <p className="text-amber-300 text-sm">{formError}</p>
                  )}

                  <button
                    onClick={handleStart}
                    className="w-full px-8 py-4 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] shadow-lg bg-brand"
                    style={{ boxShadow: "0 10px 30px -10px #3366FF" }}
                  >
                    Begin assessment
                  </button>

                  <button
                    onClick={handleBackToPicker}
                    className="w-full text-sm text-slate-400 hover:text-white underline pt-2"
                  >
                    Change scenario
                  </button>

                  <p className="text-xs text-slate-500 text-center pt-2">
                    By continuing, you consent to your name, email, and spoken
                    answers being saved for assessment purposes.
                  </p>
                </div>

                {!sr.supported && (
                  <p className="mt-6 text-amber-300 text-sm text-center">
                    Speech recognition not detected. Use Chrome or Edge.
                  </p>
                )}
              </div>
            </div>
          )}

          {stage === "intro" && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1 mb-6">
                <span className="w-2 h-2 rounded-full bg-white animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-white animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-white animate-bounce"></span>
              </div>
              <p className="text-slate-200 max-w-md text-lg">
                &quot;{selectedScenario.introSpoken}&quot;
              </p>
              <button
                onClick={handleSkipIntro}
                className="mt-8 text-sm text-slate-400 hover:text-white underline"
              >
                Skip intro
              </button>
            </div>
          )}

          {(stage === "ready" || stage === "listening") && (
            <div className="flex-1 flex flex-col">
              <div className="bg-slate-800 rounded-xl p-5 mb-6 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs uppercase tracking-wider text-brand font-semibold">
                    Stage {currentStage}: {currentTitle}
                  </div>
                  <button
                    onClick={handleReplayQuestion}
                    className="text-xs text-slate-400 hover:text-white underline"
                  >
                    Replay
                  </button>
                </div>
                <p className="text-white leading-relaxed">{currentQuestion}</p>
              </div>

              <div className="flex flex-col items-center py-6">
                <div className="relative inline-block">
                  <div className={sr.listening ? "pulse-ring" : ""}>
                    <button
                      onClick={handleRecord}
                      className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${sr.listening ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/40" : "bg-white hover:bg-slate-50 shadow-lg text-brand"}`}
                    >
                      {sr.listening ? (
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <rect x="6" y="6" width="12" height="12" rx="2" />
                        </svg>
                      ) : (
                        <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-400">
                  {sr.listening
                    ? "Tap to stop when you're done"
                    : "Tap the microphone to answer"}
                </p>
              </div>

              {(sr.transcript || sr.interim) && (
                <div className="mt-4 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                    You&apos;re saying
                  </div>
                  <p className="text-slate-100 leading-relaxed">
                    {sr.transcript}
                    <span className="text-slate-400">{sr.interim}</span>
                  </p>
                </div>
              )}

              {apiError && (
                <div className="mt-4 bg-red-900/30 border border-red-700 rounded-xl p-4">
                  <p className="text-red-200 text-sm">{apiError}</p>
                </div>
              )}

              {sr.error && (
                <div className="mt-4 bg-amber-900/30 border border-amber-700 rounded-xl p-4">
                  <p className="text-amber-200 text-sm">{sr.error}</p>
                </div>
              )}
            </div>
          )}

          {stage === "processing" && (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="flex items-center gap-1 mb-4">
                <span className="w-3 h-3 rounded-full bg-white animate-bounce"></span>
                <span className="w-3 h-3 rounded-full bg-white animate-bounce"></span>
                <span className="w-3 h-3 rounded-full bg-white animate-bounce"></span>
              </div>
              <p className="text-slate-300">
                {currentStage < TOTAL_STAGES
                  ? "Considering your answer..."
                  : "Assessing your responses across all three stages..."}
              </p>
            </div>
          )}

          {stage === "scorecard" && feedback && (
            <div className="flex-1 flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-semibold text-xl">Your feedback</h2>
                <RatingBadge rating={feedback.student.rating} />
              </div>

              {feedback.student.strengths.length > 0 && (
                <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-4 mb-4">
                  <div className="text-xs uppercase tracking-wider text-emerald-300 font-semibold mb-2">
                    What you did well
                  </div>
                  <ul className="space-y-2">
                    {feedback.student.strengths.map((s, i) => (
                      <li key={i} className="text-emerald-100 text-sm flex gap-2 leading-relaxed">
                        <span className="text-emerald-400 flex-shrink-0">+</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {feedback.student.improvements.length > 0 && (
                <div className="bg-amber-900/20 border border-amber-800/50 rounded-xl p-4 mb-4">
                  <div className="text-xs uppercase tracking-wider text-amber-300 font-semibold mb-2">
                    Areas to improve
                  </div>
                  <ul className="space-y-2">
                    {feedback.student.improvements.map((s, i) => (
                      <li key={i} className="text-amber-100 text-sm flex gap-2 leading-relaxed">
                        <span className="text-amber-400 flex-shrink-0">&gt;</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {feedback.student.encouragement && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-4">
                  <p className="text-slate-200 text-sm italic">
                    {feedback.student.encouragement}
                  </p>
                </div>
              )}

              {feedback.student.actionPlan.length > 0 && (
                <div
                  className="rounded-xl p-4 mb-4"
                  style={{ backgroundColor: "rgba(51, 102, 255, 0.15)", border: "1px solid rgba(51, 102, 255, 0.4)" }}
                >
                  <div
                    className="text-xs uppercase tracking-wider font-semibold mb-2"
                    style={{ color: "#9db5ff" }}
                  >
                    Your action plan before next time
                  </div>
                  <ul className="space-y-2">
                    {feedback.student.actionPlan.map((s, i) => (
                      <li key={i} className="text-white text-sm flex gap-2 leading-relaxed">
                        <span className="text-blue-300 flex-shrink-0 font-bold">{i + 1}.</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-2 mb-4 border-t border-slate-700 pt-5">
                <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
                  Your full scorecard
                </div>

                <div className="flex items-center gap-5 p-4 bg-slate-800 rounded-xl border border-slate-700 mb-4">
                  <div>
                    <div className="font-display text-4xl font-bold text-white leading-none">
                      {feedback.teacher.percentage}%
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {feedback.teacher.totalPoints} of {feedback.teacher.maxPoints} points
                    </div>
                  </div>
                  <div className="flex-1">
                    <RatingBadge rating={feedback.teacher.rating} />
                  </div>
                </div>

                {feedback.teacher.stageScores.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                      Stage breakdown
                    </div>
                    <div className="space-y-2">
                      {feedback.teacher.stageScores.map((st) => (
                        <div key={st.stage} className="bg-slate-800/60 rounded-lg p-3 border border-slate-700">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm text-slate-200">
                              Stage {st.stage}: {st.title}
                            </span>
                            <span className="text-sm font-semibold text-white">{st.percentage}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                            <div className="h-full rounded-full bg-brand" style={{ width: st.percentage + "%" }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Object.keys(feedback.teacher.categoryScores).length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                      Skill areas
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(feedback.teacher.categoryScores).map((entry) => {
                        const catId = entry[0] as CategoryId;
                        const score = entry[1];
                        return (
                          <div key={catId} className="bg-slate-800/60 rounded-lg p-3 border border-slate-700">
                            <div className="text-xs text-slate-400 mb-1">{CATEGORIES[catId] || catId}</div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-lg font-bold text-white">{score.percentage}%</span>
                              <span className="text-xs text-slate-500">{score.points}/{score.max}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {feedback.teacher.competencyScores.length > 0 && (
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                      Mapped to standards
                    </div>
                    <div className="space-y-2">
                      {feedback.teacher.competencyScores.map((c) => (
                        <div key={c.competencyId} className="flex items-start gap-3 bg-slate-800/60 rounded-lg p-3 border border-slate-700">
                          <StatusDot status={c.status} />
                          <div className="flex-1">
                            <div className="text-sm text-slate-100">{c.label}</div>
                            {c.framework && (
                              <div className="inline-block text-xs font-semibold mt-1 px-2 py-0.5 rounded" style={{ color: "#9db5ff", backgroundColor: "rgba(51,102,255,0.12)", border: "1px solid rgba(51,102,255,0.3)" }}>
                                {c.framework}
                              </div>
                            )}
                          </div>
                          <div className="text-xs font-semibold text-slate-400 whitespace-nowrap">
                            {c.status === "met" ? "2/2" : c.status === "partial" ? "1/2" : "0/2"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleFullReset}
                  className="flex-1 px-5 py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] bg-brand"
                >
                  Try another scenario
                </button>
                <button
                  onClick={() => {
                    if (feedback.student.spokenSummary) tts.speak(feedback.student.spokenSummary);
                  }}
                  className="px-5 py-3 rounded-xl font-semibold bg-slate-700 text-white hover:bg-slate-600 transition-all"
                >
                  Replay
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-1/2 bg-slate-50 p-8 overflow-y-auto">
          <div className="mb-6">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
              Your scenario
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900">
              {selectedScenario.subject}
            </h2>
            <p className="text-slate-600 text-sm mt-1">{selectedScenario.topic}</p>
          </div>

          <div className="bg-white rounded-xl overflow-hidden shadow-xl border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
                </svg>
                <span className="font-display font-semibold">
                  {selectedScenario.caseFile.title}
                </span>
              </div>
              <span className="text-xs text-slate-400 tracking-wider">CASE BRIEF</span>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
                  Service user
                </div>
                <p className="text-slate-900 font-semibold">
                  {selectedScenario.caseFile.serviceUser}
                </p>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
                  Background
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">
                  {selectedScenario.caseFile.background}
                </p>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
                  Your history with them
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">
                  {selectedScenario.caseFile.history}
                </p>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
                  Today&apos;s observations
                </div>
                <ul className="space-y-2.5">
                  {selectedScenario.caseFile.observations.map((obs, i) => (
                    <li
                      key={i}
                      className="text-slate-800 text-sm leading-relaxed pl-4 border-l-2 border-amber-400"
                    >
                      {obs}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: "met" | "partial" | "not_met" }) {
  if (status === "met") {
    return <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center flex-shrink-0 text-sm font-bold">+</div>;
  }
  if (status === "partial") {
    return <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center flex-shrink-0 text-sm font-bold">~</div>;
  }
  return <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-300 flex items-center justify-center flex-shrink-0 text-sm font-bold">x</div>;
}

function RatingBadge({ rating }: { rating: Rating }) {
  const band = RATING_BANDS[rating] ?? RATING_BANDS.developing;
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${band.bgLight} ${band.textLight} ${band.borderLight}`}
    >
      {band.label}
    </span>
  );
}
