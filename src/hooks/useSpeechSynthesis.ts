"use client";

import { useCallback, useEffect, useState } from "react";

export function useSpeechSynthesis() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const pickVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (!voices.length) return null;
    const tests: Array<(v: SpeechSynthesisVoice) => boolean> = [
      (v) => v.name.includes("Google UK English Female"),
      (v) => v.name.includes("Samantha"),
      (v) => v.name.includes("Karen"),
      (v) => v.name.includes("Microsoft Libby"),
      (v) => v.name.includes("Microsoft Sonia"),
      (v) => v.lang === "en-GB",
      (v) => v.lang.startsWith("en"),
    ];
    for (const test of tests) {
      const found = voices.find(test);
      if (found) return found;
    }
    return voices[0];
  }, [voices]);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        onEnd?.();
        return;
      }
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      const voice = pickVoice();
      if (voice) utter.voice = voice;
      utter.rate = 1.0;
      utter.pitch = 1.0;
      utter.onstart = () => setSpeaking(true);
      utter.onend = () => {
        setSpeaking(false);
        onEnd?.();
      };
      utter.onerror = () => {
        setSpeaking(false);
        onEnd?.();
      };
      window.speechSynthesis.speak(utter);
    },
    [pickVoice],
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { speak, stopSpeaking, speaking };
}
