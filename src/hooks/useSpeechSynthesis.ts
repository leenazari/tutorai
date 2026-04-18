"use client";

import { useCallback, useRef, useState } from "react";

export function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentUrlRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (currentUrlRef.current) {
      URL.revokeObjectURL(currentUrlRef.current);
      currentUrlRef.current = null;
    }
  }, []);

  const speak = useCallback(
    async (text: string, onEnd?: () => void) => {
      cleanup();
      setSpeaking(true);

      try {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          throw new Error(`TTS request failed with status ${response.status}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        currentUrlRef.current = url;

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          setSpeaking(false);
          cleanup();
          onEnd?.();
        };
        audio.onerror = () => {
          setSpeaking(false);
          cleanup();
          onEnd?.();
        };

        await audio.play();
      } catch (err) {
        console.error("TTS error:", err);
        setSpeaking(false);
        cleanup();
        onEnd?.();
      }
    },
    [cleanup],
  );

  const stopSpeaking = useCallback(() => {
    cleanup();
    setSpeaking(false);
  }, [cleanup]);

  return { speak, stopSpeaking, speaking };
}
