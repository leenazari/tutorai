"use client";

import { useCallback, useEffect, useState } from "react";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import type { Feedback, Scenario, Stage, StudentIdentity } from "@/types";

interface TutorProps {
  scenarios: Scenario[];
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Tutor({ scenarios }: TutorProps) {
  const [stage, setStage] = useState<Stage>("pick");
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [apiError, setApiError] = useState("");
  const [identity, setIdentity] = useState<StudentIdentity | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [formError, setFormError] = useState("");

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
    setStage("intro");
    tts.speak(selectedScenario.introSpoken, () => setStage("ready"));
  };

  const handleSkipIntro = () => {
    tts.stopSpeaking();
    setStage("ready");
  };

  const submitAnswer = useCallback(
    async (text: string) => {
      if (!selectedScenario) return;
      setStage("processing");
      setApiError("");
      try {
        const response = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenarioId: selectedScenario.id,
            studentAnswer: text,
            studentName: identity?.name,
            studentEmail: identity?.email,
          }),
        });
        if (!response.ok) {
          const errData = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));
          throw new Error(
            errData.error || `Request failed with ${response.status}`,
          );
        }
        const data = (await response.json()) as { feedback: Feedback };
        setFeedback(data.feedback);
        setStage("feedback");
        tts.speak(data.feedback.student.spokenSummary);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setApiError(`Could not get feedback. ${message}`);
        setStage("ready");
      }
    },
    [selectedScenario, tts, identity],
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
      submitAnswer(usable);
    } else {
      tts.stopSpeaking();
      setApiError("");
      sr.start();
      setStage("listening");
    }
  };

  const handleRetrySameScenario = () => {
    tts.stopSpeaking();
    setFeedback(null);
    setStage("ready");
  };

  const handleFullReset = useCallback(() => {
    tts.stopSpeaking();
    sr.hardReset();
    setFeedback(null);
    setApiError("");
    setIdentity(null);
    setNameInput("");
    setEmailInput("");
    setSelectedScenario(null);
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
              {selectedScenario.subject} · {selectedScenario.topic}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {identity && (
            <div className="text-slate-600">
              <span className="font-semibold">{identity.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Live session
          </div>
          <button
            onClick={handleFullReset}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
            title="Pick another topic (Esc)"
          >
            Pick topic
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
              <div className="font-display font-semibold text-lg">Your AI Tutor</div>
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
                  Enter your details to begin. Your session will be saved so your
                  tutor can review your progress.
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
                    Start session
                  </button>

                  <button
                    onClick={handleBackToPicker}
                    className="w-full text-sm text-slate-400 hover:text-white underline pt-2"
                  >
                    Change topic
                  </button>

                  <p className="text-xs text-slate-500 text-center pt-2">
                    By continuing, you consent to your name, email, and spoken
                    answer being saved for assessment purposes.
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
                <span className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:0s]"></span>
                <span className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:0.4s]"></span>
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
                <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                  Your question
                </div>
                <p className="text-white leading-relaxed">
                  {selectedScenario.questionText}
                </p>
              </div>

              <div className="flex flex-col items-center py-6">
                <div className="relative inline-block">
                  <div className={sr.listening ? "pulse-ring" : ""}>
                    <button
                      onClick={handleRecord}
                      className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                        sr.listening
                          ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/40"
                          : "bg-white hover:bg-slate-50 shadow-lg text-brand"
                      }`}
                    >
                      {sr.listening ? (
                        <svg
                          className="w-8 h-8 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <rect x="6" y="6" width="12" height="12" rx="2" />
                        </svg>
                      ) : (
                        <svg
                          className="w-9 h-9"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
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
                <span className="w-3 h-3 rounded-full bg-white animate-bounce [animation-delay:0s]"></span>
                <span className="w-3 h-3 rounded-full bg-white animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-3 h-3 rounded-full bg-white animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <p className="text-slate-300">Reviewing your answer...</p>
            </div>
          )}

          {stage === "feedback" && feedback && (
            <div className="flex-1 flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-semibold text-xl">
                  Your feedback
                </h2>
                <RatingBadge rating={feedback.student.rating} />
              </div>

              {feedback.student.strengths &&
                feedback.student.strengths.length > 0 && (
                  <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-4 mb-4">
                    <div className="text-xs uppercase tracking-wider text-emerald-300 font-semibold mb-2">
                      What you did well
                    </div>
                    <ul className="space-y-2">
                      {feedback.student.strengths.map((s, i) => (
                        <li
                          key={i}
                          className="text-emerald-100 text-sm flex gap-2 leading-relaxed"
                        >
                          <span className="text-emerald-400 flex-shrink-0">✓</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {feedback.student.improvements &&
                feedback.student.improvements.length > 0 && (
                  <div className="bg-amber-900/20 border border-amber-800/50 rounded-xl p-4 mb-4">
                    <div className="text-xs uppercase tracking-wider text-amber-300 font-semibold mb-2">
                      Areas to improve
                    </div>
                    <ul className="space-y-2">
                      {feedback.student.improvements.map((s, i) => (
                        <li
                          key={i}
                          className="text-amber-100 text-sm flex gap-2 leading-relaxed"
                        >
                          <span className="text-amber-400 flex-shrink-0">→</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {feedback.student.actionPlan &&
                feedback.student.actionPlan.length > 0 && (
                  <div
                    className="rounded-xl p-4 mb-4"
                    style={{
                      backgroundColor: "rgba(51, 102, 255, 0.15)",
                      border: "1px solid rgba(51, 102, 255, 0.4)",
                    }}
                  >
                    <div
                      className="text-xs uppercase tracking-wider font-semibold mb-2"
                      style={{ color: "#9db5ff" }}
                    >
                      Your action plan before next time
                    </div>
                    <ul className="space-y-2">
                      {feedback.student.actionPlan.map((s, i) => (
                        <li
                          key={i}
                          className="text-white text-sm flex gap-2 leading-relaxed"
                        >
                          <span className="text-blue-300 flex-shrink-0 font-bold">
                            {i + 1}.
                          </span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {feedback.student.actionPlan &&
                feedback.student.actionPlan.length > 0 && (
                  <div
                    className="rounded-xl p-4 mb-4"
                    style={{
                      backgroundColor: "rgba(51, 102, 255, 0.15)",
                      border: "1px solid rgba(51, 102, 255, 0.4)",
                    }}
                  >
                    <div
                      className="text-xs uppercase tracking-wider font-semibold mb-2"
                      style={{ color: "#9db5ff" }}
                    >
                      Your action plan before next time
                    </div>
                    <ul className="space-y-2">
                      {feedback.student.actionPlan.map((s, i) => (
                        <li
                          key={i}
                          className="text-white text-sm flex gap-2 leading-relaxed"
                        >
                          <span className="text-blue-300 flex-shrink-0 font-bold">
                            {i + 1}.
                          </span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleRetrySameScenario}
                  className="flex-1 px-5 py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] bg-brand"
                >
                  Try again
                </button>
                <button
                  onClick={handleFullReset}
                  className="px-5 py-3 rounded-xl font-semibold bg-slate-700 text-white hover:bg-slate-600 transition-all"
                >
                  Pick another topic
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
            <p className="text-slate-600 text-sm mt-1">
              {selectedScenario.topic}
            </p>
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
              <span className="text-xs text-slate-400 tracking-wider">
                CASE BRIEF
              </span>
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

function ScenarioPicker({
  scenarios,
  onPick,
}: {
  scenarios: Scenario[];
  onPick: (s: Scenario) => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold bg-brand">
          I
        </div>
        <div>
          <div className="font-display font-semibold text-slate-900 text-sm">
            Interviewa Tutor
          </div>
          <div className="text-xs text-slate-500">Scenario-based training</div>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-5xl w-full">
          <div className="text-center mb-10">
            <h1 className="font-display text-4xl font-bold text-slate-900 mb-3">
              Choose a scenario
            </h1>
            <p className="text-slate-600 text-lg">
              Pick a topic to practice. You will get structured feedback on how
              you did.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => onPick(scenario)}
                className="group text-left bg-white rounded-2xl p-6 border border-slate-200 hover:border-brand hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="text-xs uppercase tracking-wider font-bold text-brand mb-3">
                  {scenario.subject}
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900 mb-3 leading-tight">
                  {scenario.topic}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  {scenario.description}
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold text-brand group-hover:gap-3 transition-all">
                  Start this scenario
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RatingBadge({ rating }: { rating: string }) {
  const styles: Record<string, string> = {
    developing: "bg-amber-100 text-amber-800 border-amber-200",
    good: "bg-blue-100 text-blue-800 border-blue-200",
    excellent: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };
  const labels: Record<string, string> = {
    developing: "Developing",
    good: "Good",
    excellent: "Excellent",
  };
  const key = (rating || "developing").toLowerCase();
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${styles[key] || styles.developing}`}
    >
      {labels[key] || "Developing"}
    </span>
  );
}
