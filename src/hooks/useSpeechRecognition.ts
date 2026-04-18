
"use client";

import { useEffect, useRef, useState } from "react";

type SpeechRecognitionResultItem = { transcript: string };
type SpeechRecognitionAlternativeResult = {
  [index: number]: SpeechRecognitionResultItem;
  isFinal: boolean;
};
type SpeechRecognitionResultList = {
  [index: number]: SpeechRecognitionAlternativeResult;
  length: number;
};
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type SpeechRecognitionConstructor = new () => SpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function useSpeechRecognition() {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState("");
  const recRef = useRef<SpeechRecognition | null>(null);
  const finalRef = useRef("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      setError("Speech recognition is not supported in this browser. Try Chrome or Edge.");
      return;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-GB";

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = "";
      let finalText = finalRef.current;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript + " ";
        } else {
          interimText += result[0].transcript;
        }
      }
      finalRef.current = finalText;
      setTranscript(finalText);
      setInterim(interimText);
    };

    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === "not-allowed") {
        setError("Microphone access denied. Enable it in your browser settings.");
      } else if (e.error !== "no-speech") {
        setError(`Speech recognition error: ${e.error}`);
      }
    };

    rec.onend = () => setListening(false);
    recRef.current = rec;
  }, []);

  const start = () => {
    if (!recRef.current) return;
    finalRef.current = "";
    setTranscript("");
    setInterim("");
    setError("");
    setListening(true);
    try {
      recRef.current.start();
    } catch (e) {
      // already started
    }
  };

  const stop = (): string => {
    if (!recRef.current) return "";
    try {
      recRef.current.stop();
    } catch (e) {
      // ignore
    }
    setTimeout(() => {
      try {
        recRef.current?.abort();
      } catch (e) {
        // ignore
      }
    }, 300);
    setListening(false);
    return finalRef.current.trim();
  };

  const hardReset = () => {
    try {
      recRef.current?.abort();
    } catch (e) {
      // ignore
    }
    try {
      recRef.current?.stop();
    } catch (e) {
      // ignore
    }
    setListening(false);
    setTranscript("");
    setInterim("");
    finalRef.current = "";
  };

  return { supported, listening, transcript, interim, error, start, stop, hardReset };
}
