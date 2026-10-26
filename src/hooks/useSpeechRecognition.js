'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const ERROR_MESSAGES = {
  'not-allowed': 'Microphone access was blocked. Allow it in your browser settings and try again.',
  'service-not-allowed': 'Speech recognition is not allowed in this browser or context.',
  'audio-capture': 'No microphone was found.',
  network: 'Speech recognition needs an internet connection.',
  'language-not-supported': 'This language is not supported for voice input.',
};

// Android Chrome marks every partial phrase as a "final" result and repeats everything said so far in it
// ("write", "write the", "write the code"). Taken literally that adds the same words again and again, so on
// Android the repeats are merged into one growing phrase and only the new words are passed on.
const IDLE_FLUSH_MS = 1000;
const isAndroid = () => typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);
const toWords = (s) => s.trim().split(/\s+/).filter(Boolean);
const startsWithWords = (full, start) =>
  start.length <= full.length && start.every((w, i) => w.toLowerCase() === full[i].toLowerCase());

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

  // Android only: words recognised in this session, how many were already passed on, and a pause timer
  const mergeRef = useRef(false);
  const spokenRef = useRef([]);
  const sentRef = useRef(0);
  const interimRef = useRef('');
  const timerRef = useRef(null);

  useEffect(() => {
    callbackRef.current = onFinalText;
  }, [onFinalText]);

  // What the "Listening…" line shows: words not passed on yet, plus the still-changing text
  const preview = useCallback(() => {
    const waiting = spokenRef.current.slice(sentRef.current).join(' ');
    setInterim([waiting, interimRef.current].filter(Boolean).join(' '));
  }, []);

  // Passes on the words that have not been sent yet
  const flush = useCallback(() => {
    clearTimeout(timerRef.current);
    const text = spokenRef.current.slice(sentRef.current).join(' ');
    sentRef.current = spokenRef.current.length;
    if (text) callbackRef.current?.(text);
    preview();
  }, [preview]);

  const resetSession = useCallback(() => {
    clearTimeout(timerRef.current);
    spokenRef.current = [];
    sentRef.current = 0;
  }, []);

  useEffect(() => {
    setSupported(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));
    return () => {
      wantRef.current = false;
      clearTimeout(timerRef.current);
      recRef.current?.abort();
    };
  }, []);

  const stop = useCallback(() => {
    wantRef.current = false;
    flush();
    recRef.current?.stop();
    interimRef.current = '';
    setInterim('');
  }, [flush]);

  const start = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setError(null);
    mergeRef.current = isAndroid();
    resetSession();

    const rec = new SpeechRecognition();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;

    // Android: merge a repeated or growing phrase into one, and pass it on after a short pause
    const absorb = (transcript) => {
      const next = toWords(transcript);
      const have = spokenRef.current;
      if (!have.length || startsWithWords(next, have)) {
        spokenRef.current = next; // the first phrase, or the same phrase grown or repeated
      } else if (startsWithWords(have, next)) {
        return; // an older, shorter copy of what we already have
      } else {
        flush(); // a new phrase that does not continue the last one
        spokenRef.current = next;
        sentRef.current = 0;
      }
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flush, IDLE_FLUSH_MS);
    };

    rec.onresult = (event) => {
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          const clean = transcript.trim();
          if (!clean) continue;
          if (mergeRef.current) absorb(clean);
          else callbackRef.current?.(clean);
        } else {
          interimText += transcript;
        }
      }
      interimRef.current = interimText;
      preview();
    };

    rec.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      wantRef.current = false;
      setError(ERROR_MESSAGES[event.error] ?? 'Voice input stopped unexpectedly. Try again.');
    };

    rec.onend = () => {
      flush();
      resetSession();
      if (wantRef.current) {
        try {
          rec.start(); // keep going after a pause in speech
          return;
        } catch {
          wantRef.current = false;
        }
      }
      setListening(false);
      interimRef.current = '';
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
  }, [lang, flush, preview, resetSession]);

  return { supported, listening, interim, error, start, stop };
}