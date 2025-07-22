/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";

export interface UseWithSpeechOptions {
  /** Language code for speech recognition (e.g. 'en-US') */
  recognitionLang?: string;
}

export interface UseWithSpeechReturn {
  /** Text-to-Speech */
  synthesisSupported: boolean;
  voices: SpeechSynthesisVoice[];
  speaking: boolean;
  speak: (text: string) => void;
  cancelSpeaking: () => void;

  /** Pause/Resume */
  paused: boolean;
  pauseSpeaking: () => void;
  resumeSpeaking: () => void;

  /** Speech-to-Text */
  recognitionSupported: boolean;
  transcript: string;
  listening: boolean;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
}

export const useWithSpeech = ({
  recognitionLang = "en-US",
}: UseWithSpeechOptions = {}): UseWithSpeechReturn => {
  // Text-to-Speech (TTS) setup
  const synthesisSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!synthesisSupported) return;
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    loadVoices();
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, [synthesisSupported]);

  const speak = (text: string) => {
    if (!synthesisSupported) return;
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    const defaultVoice = voices.find((v) => v.default) || voices[0];
    if (defaultVoice) {
      utterance.voice = defaultVoice;
    }
    utterance.onstart = () => {
      setSpeaking(true);
      setPaused(false);
    };
    utterance.onpause = () => setPaused(true);
    utterance.onresume = () => setPaused(false);
    utterance.onend = () => {
      setSpeaking(false);
      setPaused(false);
    };
    window.speechSynthesis.speak(utterance);
  };

  const cancelSpeaking = () => {
    if (!synthesisSupported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  };

  const pauseSpeaking = () => {
    if (!synthesisSupported) return;
    window.speechSynthesis.pause();
    setPaused(true);
  };

  const resumeSpeaking = () => {
    if (!synthesisSupported) return;
    window.speechSynthesis.resume();
    setPaused(false);
  };

  // Speech-to-Text (STT) setup
  const RecogClass =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || (window as any).webkitSpeechRecognition);
  const recognitionSupported = Boolean(RecogClass);
  const recognitionRef = useRef<any | null>(null);
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recognitionSupported) return;
    const recog = new RecogClass();
    recognitionRef.current = recog;
    recog.lang = recognitionLang;
    recog.interimResults = false;
    recog.maxAlternatives = 1;

    recog.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
    };
    recog.onerror = (e: any) => {
      setError(e.error || "Speech recognition error");
    };
    recog.onend = () => {
      setListening(false);
    };

    return () => {
      recog.stop();
    };
  }, [RecogClass, recognitionLang, recognitionSupported]);

  const startListening = () => {
    if (!recognitionSupported || !recognitionRef.current) return;
    setError(null);
    recognitionRef.current.start();
    setListening(true);
  };

  const stopListening = () => {
    if (!recognitionSupported || !recognitionRef.current) return;
    recognitionRef.current.stop();
    setListening(false);
  };

  return {
    synthesisSupported,
    voices,
    speaking,
    speak,
    cancelSpeaking,
    paused,
    pauseSpeaking,
    resumeSpeaking,
    recognitionSupported,
    transcript,
    listening,
    startListening,
    stopListening,
    error,
  };
};
