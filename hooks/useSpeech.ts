'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
}

interface UseSpeechReturn extends SpeechState {
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// Extend Window for browser Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export function useSpeech(): UseSpeechReturn {
  const [state, setState] = useState<SpeechState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    interimTranscript: '',
    error: null,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    if (SpeechRecognitionAPI) {
      setState((s) => ({ ...s, isSupported: true }));

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let final = '';
        let interim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            final += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }

        setState((s) => ({
          ...s,
          transcript: s.transcript + final,
          interimTranscript: interim,
        }));
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setState((s) => ({
          ...s,
          isListening: false,
          error: event.error === 'not-allowed' ? 'Microphone access denied.' : `Speech error: ${event.error}`,
        }));
      };

      recognition.onend = () => {
        setState((s) => ({ ...s, isListening: false, interimTranscript: '' }));
      };

      recognitionRef.current = recognition;
    }

    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setState((s) => ({ ...s, isListening: true, error: null }));
    try {
      recognitionRef.current.start();
    } catch {
      // already started
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setState((s) => ({ ...s, isListening: false }));
  }, []);

  const resetTranscript = useCallback(() => {
    setState((s) => ({ ...s, transcript: '', interimTranscript: '' }));
  }, []);

  return { ...state, startListening, stopListening, resetTranscript };
}
