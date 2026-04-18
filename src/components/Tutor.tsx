"use client";

import { useCallback, useEffect, useState } from "react";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import type { Feedback, Scenario, Stage, StudentIdentity } from "@/types";
import { RATING_BANDS, type Rating } from "@/lib/categories";

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
      if (!selectedScenario || !identity) return;
      setStage("processing");
      setApiError("");
      try {
        const response = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenarioId: selectedScenario.id,
            studentAnswer: text,
            studentName: identity.name,
            studentEmail: identity.email,
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

        // Fire-and-forget save. If it fails, the student experience still works.
        const competencyCategories: Record<string, string> = {};
        for (const comp of selectedScenario.competencies) {
          competencyCategories[comp.id] = comp.category;
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
            studentAnswer: text,
            feedback: data.feedback,
            competencyCategories,
          }),
        }).catch((err) => console.error("Save session failed:", err));
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
                      className="w-full px-4 py-
