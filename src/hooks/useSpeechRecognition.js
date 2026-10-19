'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const ERROR_MESSAGES = {
  'not-allowed': 'Microphone access was blocked. Allow it in your browser settings and try again.',
  'service-not-allowed': 'Speech recognition is not allowed in this browser or context.',
  'audio-capture': 'No microphone was found.',
  network: 'Speech recognition needs an internet connection.',
  'language-not-supported': 'This language is not supported for voice input.',
};

/**
 * Thin wrapper around the browser Web Speech API (SpeechRecognition).
 * - Final phrases are passed to onFinalText as they are recognised.
 * - Interim (still-changing) text is exposed separately so it can be previewed.
 * - Chrome ends a session after silence, so we restart it while the user wants to keep dictating.
 */
export function useSpeechRecognition({ lang = 'en-IN', onFinalText } = {}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState(null);

  const recRef = useRef(null);
  const wantRef = useRef(false);
  const callbackRef = useRef(onFinalText);

  useEffect(() => {
    callbackRef.current = onFinalText;
  }, [onFinalText]);

  useEffect(() => {
    setSupported(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));
    return () => {
      wantRef.current = false;
      recRef.current?.abort();
    };
  }, []);

  const stop = useCallback(() => {
    wantRef.current = false;
    recRef.current?.stop();
    setInterim('');
  }, []);

  const start = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setError(null);
    const rec = new SpeechRecognition();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (event) => {
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          const clean = transcript.trim();
          if (clean) callbackRef.current?.(clean);
        } else {
          interimText += transcript;
        }
      }
      setInterim(interimText);
    };

    rec.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      wantRef.current = false;
      setError(ERROR_MESSAGES[event.error] ?? 'Voice input stopped unexpectedly. Try again.');
    };

    rec.onend = () => {
      if (wantRef.current) {
        try {
          rec.start(); // keep going after a pause in speech
          return;
        } catch {
          wantRef.current = false;
        }
      }
      setListening(false);
      setInterim('');
    };

    recRef.current = rec;
    wantRef.current = true;
    try {
      rec.start();
      setListening(true);
    } catch {
      wantRef.current = false;
      setError('Could not start voice input. Try again.');
    }
  }, [lang]);

  return { supported, listening, interim, error, start, stop };
}
