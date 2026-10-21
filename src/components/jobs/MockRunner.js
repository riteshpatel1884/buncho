'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { completeMock, submitMock } from '@/app/job-actions';
import { requestFeedback } from '@/lib/ai-client';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { MAX_ANSWER_LENGTH, MIN_ANSWER_LENGTH } from '@/lib/constants';
import DifficultyBadge from '@/components/DifficultyBadge';
import { Mic, Stop } from '@/components/icons';

const two = (n) => String(n).padStart(2, '0');
const fmt = (s) => `${two(Math.floor(s / 60))}:${two(s % 60)}`;

// questions: [{ id, title, difficulty, topic, minutes, body }]  (body is the question Markdown, rendered on the server)
export default function MockRunner({ mockId, jobId, endsAt, questions }) {
  const router = useRouter();
  const storageKey = `buncho-mock-${mockId}`;
  const end = new Date(endsAt).getTime();

  const [answers, setAnswers] = useState({});
  const [active, setActive] = useState(0);
  const [left, setLeft] = useState(() => Math.max(0, Math.round((end - Date.now()) / 1000)));
  const [phase, setPhase] = useState('writing'); // writing | saving | evaluating | error
  const [progress, setProgress] = useState('');
  const [error, setError] = useState(null);

  const answersRef = useRef(answers);
  const activeRef = useRef(0);
  const busyRef = useRef(false);
  answersRef.current = answers;
  activeRef.current = active;

  // Restore a draft if the page was refreshed
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setAnswers(JSON.parse(raw));
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(answers));
    } catch {}
  }, [answers, storageKey]);

  const setAnswer = (id, value) => setAnswers((a) => ({ ...a, [id]: value.slice(0, MAX_ANSWER_LENGTH) }));

  const appendSpeech = useCallback(
    (chunk) => {
      const id = questions[activeRef.current]?.id;
      if (!id) return;
      setAnswers((a) => {
        const base = (a[id] ?? '').replace(/\s+$/, '');
        return { ...a, [id]: `${base ? `${base} ` : ''}${chunk}`.slice(0, MAX_ANSWER_LENGTH) };
      });
    },
    [questions],
  );
  const { supported, listening, interim, error: voiceError, start: startVoice, stop: stopVoice } = useSpeechRecognition({ lang: 'en-IN', onFinalText: appendSpeech });

  const finish = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setError(null);
    stopVoice();

    setPhase('saving');
    setProgress('Saving your answers…');
    const saved = await submitMock(mockId, answersRef.current).catch(() => ({ ok: false, error: 'Could not save your answers. Check your connection.' }));
    if (!saved.ok) {
      setError(saved.error);
      setPhase('error');
      busyRef.current = false;
      return;
    }

    setPhase('evaluating');
    for (let i = 0; i < saved.saved.length; i += 1) {
      setProgress(`Getting AI feedback ${i + 1} of ${saved.saved.length}…`);
      await requestFeedback(saved.saved[i]); // a failure is reported on the results page
    }

    await completeMock(mockId);
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    router.push(`/jobs/${jobId}/mock/${mockId}`);
  }, [jobId, mockId, router, stopVoice, storageKey]);

  // Countdown. When time runs out the answers are submitted automatically.
  useEffect(() => {
    const t = setInterval(() => {
      const s = Math.max(0, Math.round((end - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) finish();
    }, 1000);
    return () => clearInterval(t);
  }, [end, finish]);

  function confirmFinish() {
    const blank = questions.filter((q) => (answers[q.id] ?? '').trim().length < MIN_ANSWER_LENGTH).length;
    const msg = blank
      ? `${blank} ${blank === 1 ? 'question has' : 'questions have'} no answer and will score 0. Submit anyway?`
      : 'Submit your answers for AI feedback? You cannot change them afterwards.';
    if (window.confirm(msg)) finish();
  }

  const q = questions[active];
  const busy = phase === 'saving' || phase === 'evaluating';
  const low = left <= 300;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6">
      <div className="sticky top-16 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface/95 px-4 py-2.5 backdrop-blur">
        <p className="text-sm font-medium">Mock assessment <span className="text-muted">· {questions.length} questions</span></p>
        <p role="timer" aria-label="Time remaining" className={`text-lg font-semibold tabular-nums ${low ? 'text-hard' : 'text-accent'}`}>{fmt(left)}</p>
      </div>

      <div role="tablist" aria-label="Questions" className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
        {questions.map((x, i) => {
          const filled = (answers[x.id] ?? '').trim().length >= MIN_ANSWER_LENGTH;
          return (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${i === active ? 'bg-accent text-accent-ink' : 'bg-surface-2 hover:bg-line'}`}
            >
              Q{i + 1}{filled && <span className="ml-1.5" aria-label="answered">✓</span>}
            </button>
          );
        })}
      </div>

      <section className="panel mt-4 p-5 sm:p-6" aria-live="polite">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold">{q.title}</h2>
          <DifficultyBadge difficulty={q.difficulty} />
          <span className="text-xs text-muted">{q.topic} · about {q.minutes} min</span>
        </div>
        <div className="mt-4">{q.body}</div>
      </section>

      <section className="panel mt-4">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-3 py-2">
          {supported ? (
            <button
              type="button"
              onClick={listening ? stopVoice : startVoice}
              aria-pressed={listening}
              disabled={busy}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium ${listening ? 'bg-hard text-white' : 'bg-surface-2 hover:bg-line'}`}
            >
              {listening ? <Stop width={14} height={14} /> : <Mic width={14} height={14} />}
              {listening ? 'Stop dictating' : 'Dictate'}
            </button>
          ) : (
            <p className="text-sm text-muted">Voice input isn&rsquo;t available in this browser.</p>
          )}
          <span className="ml-auto text-xs tabular-nums text-muted">{(answers[q.id] ?? '').length.toLocaleString()} / {MAX_ANSWER_LENGTH.toLocaleString()}</span>
        </div>
        <label htmlFor={`mock-answer-${q.id}`} className="sr-only">Your answer to question {active + 1}</label>
        <textarea
          id={`mock-answer-${q.id}`}
          value={answers[q.id] ?? ''}
          onChange={(e) => setAnswer(q.id, e.target.value)}
          disabled={busy}
          spellCheck="true"
          placeholder="Answer as you would in the interview. Explain your reasoning, not just the conclusion."
          className="block min-h-72 w-full resize-y bg-transparent px-4 py-3 font-mono text-[0.85rem] leading-relaxed outline-none placeholder:text-muted/70"
        />
        {listening && interim && <p className="border-t border-line px-4 py-2 text-xs italic text-muted">{interim}</p>}
        {voiceError && <p role="alert" className="border-t border-line px-4 py-2 text-xs text-hard">{voiceError}</p>}
      </section>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button type="button" disabled={active === 0 || busy} onClick={() => setActive(active - 1)} className="rounded-full bg-surface-2 px-4 py-2 text-sm font-medium hover:bg-line disabled:opacity-40">Previous</button>
          <button type="button" disabled={active === questions.length - 1 || busy} onClick={() => setActive(active + 1)} className="rounded-full bg-surface-2 px-4 py-2 text-sm font-medium hover:bg-line disabled:opacity-40">Next</button>
        </div>
        <button type="button" onClick={confirmFinish} disabled={busy} className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-ink hover:opacity-90 disabled:opacity-50">
          {busy ? progress : 'Submit assessment'}
        </button>
      </div>

      {error && <p role="alert" className="mt-3 rounded-lg bg-hard/10 px-3 py-2 text-sm text-hard">{error} Your answers are still on this page, so you can try again.</p>}
    </div>
  );
}