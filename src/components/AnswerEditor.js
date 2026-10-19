'use client';

import { useCallback, useState, useTransition } from 'react';
import { saveSubmission } from '@/app/actions';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { MAX_ANSWER_LENGTH } from '@/lib/constants';
import { Mic, Stop } from './icons';

const LANGUAGES = [
  { code: 'en-IN', label: 'English (India)' },
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'hi-IN', label: 'Hindi' },
];

export default function AnswerEditor({ problemId, initialContent = '', hasSubmission = false }) {
  const [text, setText] = useState(initialContent);
  const [savedText, setSavedText] = useState(initialContent);
  const [everSaved, setEverSaved] = useState(hasSubmission);
  const [lang, setLang] = useState('en-IN');
  const [message, setMessage] = useState(null); 
  const [pending, startTransition] = useTransition();

  // Dictated phrases are appended to the end of the answer
  const appendSpeech = useCallback((chunk) => {
    setText((prev) => {
      const base = prev.replace(/\s+$/, '');
      return (base ? `${base} ${chunk}` : chunk).slice(0, MAX_ANSWER_LENGTH);
    });
  }, []);

  const { supported, listening, interim, error, start, stop } = useSpeechRecognition({
    lang,
    onFinalText: appendSpeech,
  });

  const dirty = text !== savedText;

  function handleSave() {
    if (listening) stop();
    setMessage(null);
    startTransition(async () => {
      const res = await saveSubmission(problemId, text);
      if (res.ok) {
        setSavedText(text);
        setEverSaved(true);
        setMessage({ type: 'ok', text: 'Answer saved. The expert solution is unlocked below.' });
      } else {
        setMessage({ type: 'error', text: res.error });
      }
    });
  }

  return (
    <div className="rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-3 py-2.5">
        {supported ? (
          <>
            <button
              type="button"
              onClick={listening ? stop : start}
              aria-pressed={listening}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                listening ? 'bg-hard text-white' : 'bg-accent-soft text-accent hover:bg-accent hover:text-accent-ink'
              }`}
            >
              {listening ? <Stop width={16} height={16} /> : <Mic width={16} height={16} />}
              {listening ? 'Stop dictating' : 'Dictate answer'}
            </button>
            <label className="flex items-center gap-2 text-sm text-muted">
              <span className="sr-only sm:not-sr-only">Language</span>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                disabled={listening}
                className="rounded-md border border-line bg-bg px-2 py-1.5 text-sm text-ink disabled:opacity-50"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
            {listening && (
              <span className="flex h-5 items-center gap-[3px]" aria-hidden="true">
                {[0, 0.15, 0.3, 0.1, 0.25].map((d, i) => (
                  <span key={i} className="wave-bar block h-4 w-[3px] rounded-full bg-hard" style={{ animationDelay: `${d}s` }} />
                ))}
              </span>
            )}
          </>
        ) : (
          <p className="text-sm text-muted">Voice input isn&rsquo;t available in this browser. Chrome, Edge and Safari support it.</p>
        )}
      </div>

      <label htmlFor="answer" className="sr-only">
        Your answer
      </label>
      <textarea
        id="answer"
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX_ANSWER_LENGTH))}
        rows={12}
        placeholder="Write your answer here, or press Dictate answer and speak it. Explain your reasoning, not just the conclusion."
        className="block min-h-64 w-full resize-y bg-transparent px-4 py-3.5 text-base leading-relaxed outline-none placeholder:text-muted/70"
      />

      <div aria-live="polite" className="min-h-6 px-4 text-sm italic text-muted">
        {listening && (interim ? `Listening… ${interim}` : 'Listening…')}
      </div>
      {error && (
        <p role="alert" className="px-4 pb-1 text-sm text-hard">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
        <p className="text-sm text-muted">
          {text.length.toLocaleString()} / {MAX_ANSWER_LENGTH.toLocaleString()} characters
          {dirty && everSaved ? ' (unsaved changes)' : ''}
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={pending || (!dirty && everSaved)}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-opacity disabled:opacity-50"
        >
          {pending ? 'Saving…' : everSaved ? 'Save changes' : 'Submit answer'}
        </button>
      </div>

      {message && (
        <p
          role={message.type === 'error' ? 'alert' : 'status'}
          className={`border-t border-line px-4 py-3 text-sm ${message.type === 'error' ? 'text-hard' : 'text-easy'}`}
        >
          {message.text}
        </p>
      )}

      {supported && (
        <p className="border-t border-line px-4 py-3 text-xs text-muted">
          Voice input uses your browser&rsquo;s speech service. In Chrome and Edge your audio is processed by the
          browser vendor, not by Buncho. Review the transcript before saving, since technical terms are sometimes misheard.
        </p>
      )}
    </div>
  );
}
