'use client';

import { useCallback, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { saveSubmission } from '@/app/actions';
import { requestFeedback } from '@/lib/ai-client';
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
  const router = useRouter();
  const [text, setText] = useState(initialContent);
  const [savedText, setSavedText] = useState(initialContent);
  const [everSaved, setEverSaved] = useState(hasSubmission);
  const [lang, setLang] = useState('en-IN');
  const [message, setMessage] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
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
      if (!res.ok) {
        setMessage({ type: 'error', text: res.error });
        return;
      }

      setSavedText(text);
      setEverSaved(true);
      setMessage({ type: 'ok', text: 'Answer saved. Getting AI feedback…' });

      // Ask the server for AI feedback on the answer that was just saved
      setEvaluating(true);
      const fb = await requestFeedback(problemId);
      setEvaluating(false);

      if (fb.ok) {
        setMessage({ type: 'ok', text: 'Feedback is ready in the AI Feedback tab.' });
        window.dispatchEvent(new CustomEvent('buncho:open-tab', { detail: 'feedback' }));
      } else {
        setMessage({
          type: 'error',
          text: `Your answer is saved, but AI feedback failed: ${fb.error} You can retry from the AI Feedback tab.`,
        });
      }
      router.refresh();
    });
  }

  const status = dirty ? (everSaved ? 'Unsaved changes' : 'Draft') : everSaved ? 'Saved' : 'Empty';

  return (
    <div className="flex min-h-[26rem] flex-1 flex-col">
      {/* Toolbar, like the language / settings row above the LeetCode editor */}
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-line px-3 py-2">
        {supported ? (
          <>
            <button
              type="button"
              onClick={listening ? stop : start}
              aria-pressed={listening}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                listening ? 'bg-hard text-white' : 'bg-surface-2 text-ink hover:bg-line'
              }`}
            >
              {listening ? <Stop width={14} height={14} /> : <Mic width={14} height={14} />}
              {listening ? 'Stop dictating' : 'Dictate'}
            </button>
            <label className="flex items-center gap-2 text-sm text-muted">
              <span className="sr-only">Language</span>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                disabled={listening}
                className="rounded-md bg-surface-2 px-2 py-1.5 text-sm text-ink disabled:opacity-50"
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
        <span className="ml-auto text-xs text-muted">{status}</span>
      </div>

      <label htmlFor="answer" className="sr-only">
        Your answer
      </label>
      <textarea
        id="answer"
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX_ANSWER_LENGTH))}
        placeholder="Write your answer here, or press Dictate and speak it. Explain your reasoning, not just the conclusion."
        spellCheck="true"
        className="block min-h-64 w-full flex-1 resize-none bg-transparent px-4 py-3 font-mono text-[0.85rem] leading-relaxed outline-none placeholder:text-muted/70"
      />

      <div aria-live="polite" className="min-h-5 shrink-0 px-4 pb-1 text-xs italic text-muted">
        {listening && (interim ? `Listening… ${interim}` : 'Listening…')}
      </div>
      {error && (
        <p role="alert" className="shrink-0 px-4 pb-1 text-sm text-hard">
          {error}
        </p>
      )}

      {/* Bottom bar: counter on the left, Submit on the right */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-2.5">
        <p className="text-xs text-muted">
          {text.length.toLocaleString()} / {MAX_ANSWER_LENGTH.toLocaleString()}
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={pending || (!dirty && everSaved)}
          className="rounded-md bg-go px-5 py-1.5 text-sm font-semibold text-go-ink transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? (evaluating ? 'Getting feedback…' : 'Saving…') : everSaved ? 'Save & re-evaluate' : 'Submit'}
        </button>
      </div>

      {/* Result strip, like the Test Result panel */}
      <div className="shrink-0 border-t border-line bg-surface-2 px-4 py-3">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">Result</p>
        {message ? (
          <p role={message.type === 'error' ? 'alert' : 'status'} className={`mt-1 text-sm ${message.type === 'error' ? 'text-hard' : 'text-easy'}`}>
            {message.text}
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted">{everSaved ? 'Your answer is saved.' : 'You must submit your answer first.'}</p>
        )}
        {supported && (
          <p className="mt-2 text-xs text-muted">
            Voice input uses your browser&rsquo;s speech service. In Chrome and Edge your audio is processed by the browser vendor, not by Buncho. Review the transcript before saving, since technical terms are sometimes misheard.
          </p>
        )}
      </div>
    </div>
  );
}