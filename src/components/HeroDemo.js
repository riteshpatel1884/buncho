'use client';

import { useEffect, useState } from 'react';
import { Mic } from './icons';

// Decorative preview of the problem workspace: dictation, submit, then AI feedback.
const SCRIPT =
  'I’d start by finding where it fails. First I’d log the retrieved chunks for the bad answers and check whether the right evidence was retrieved at all. If it was, the problem is in generation, so I’d tighten the prompt to answer only from the context.';
const WORDS = SCRIPT.split(' ');

// The newest words are shown dimmed, like the interim results a browser's speech recognition returns
const INTERIM = 3;

// Rubric from the real feedback: the total is the sum of the four parts
const RUBRIC = [
  { label: 'Coverage', value: 30, max: 40 },
  { label: 'Accuracy', value: 26, max: 30 },
  { label: 'Reasoning', value: 13, max: 20 },
  { label: 'Clarity', value: 9, max: 10 },
];
const TARGET = RUBRIC.reduce((s, r) => s + r.value, 0); // 78

const band = (s) => {
  if (s < 1) return { label: 'Scoring…', cls: 'text-muted' };
  if (s >= 70) return { label: 'Good', cls: 'text-easy' };
  if (s >= 50) return { label: 'Partial', cls: 'text-medium' };
  return { label: 'Needs work', cls: 'text-hard' };
};

const BARS = [0.1, 0.35, 0.2, 0.5, 0.05, 0.4, 0.25, 0.45, 0.15, 0.3];

export default function HeroDemo() {
  // phase: 'typing' -> 'typed' -> 'analysing' -> 'feedback' -> (loops)
  const [phase, setPhase] = useState('typing');
  const [count, setCount] = useState(0);
  const [score, setScore] = useState(0);
  const [step, setStep] = useState(0); // how many feedback blocks are visible

  useEffect(() => {
    // Respect reduced-motion: show the finished state, no animation
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(WORDS.length);
      setPhase('feedback');
      setScore(TARGET);
      setStep(3);
      return;
    }

    const timers = [];
    let raf;
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));

    const restart = () => {
      setCount(0);
      setScore(0);
      setStep(0);
      setPhase('typing');
      later(() => type(0), 900);
    };

    const showFeedback = () => {
      setPhase('feedback');
      setScore(0);
      setStep(0);

      // Score counts up (ease-out); the rubric bars follow the same progress
      const start = performance.now();
      const frame = (now) => {
        const p = Math.min(1, (now - start) / 1400);
        setScore(Math.round(TARGET * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);

      // Feedback blocks appear one after another
      [1500, 2300, 3100].forEach((ms, i) => later(() => setStep(i + 1), ms));
      later(restart, 9500);
    };

    const submit = () => {
      setPhase('analysing');
      later(showFeedback, 1800);
    };

    const type = (n) => {
      if (n < WORDS.length) {
        setPhase('typing');
        setCount(n + 1);
        const word = WORDS[n];
        // Longer breaths after punctuation, uneven pace otherwise, like real speech
        const delay = /[.,]$/.test(word) ? 450 + Math.random() * 250 : 150 + Math.random() * 180;
        later(() => type(n + 1), delay);
      } else {
        setPhase('typed');
        later(submit, 1300);
      }
    };

    later(() => type(0), 800);
    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
    };
  }, []);

  const listening = phase === 'typing';
  const showFeedback = phase === 'feedback';

  const finalEnd = listening ? Math.max(0, count - INTERIM) : count;
  const finalText = WORDS.slice(0, finalEnd).join(' ');
  const interimText = WORDS.slice(finalEnd, count).join(' ');

  const progress = score / TARGET;
  const b = band(score);
  const tab = (on) => (on ? 'border-b-2 border-ink pb-2 text-ink' : 'pb-2 text-muted');
  const reveal = (n) =>
    `transition-all duration-500 ${step >= n ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'}`;

  return (
    <div className="panel overflow-hidden shadow-xl shadow-black/10" aria-hidden="true">
      <div className="flex h-9 items-center gap-2 border-b border-line bg-surface-2 px-3 text-xs">
        <span className="h-2.5 w-2.5 rounded-full bg-hard" />
        <span className="h-2.5 w-2.5 rounded-full bg-medium" />
        <span className="h-2.5 w-2.5 rounded-full bg-easy" />
        <span className="ml-3 text-muted">buncho / problems / reduce-rag-hallucinations</span>
      </div>

      <div className="grid sm:grid-cols-2">
        {/* Left: problem description, then the AI feedback tab after submit */}
        <div className="p-4">
          <div className="flex gap-4 border-b border-line pb-0 text-xs font-medium">
            <span className={tab(!showFeedback)}>Description</span>
            <span className={tab(showFeedback)}>AI Feedback</span>
            <span className={tab(false)}>Community</span>
          </div>

          {showFeedback ? (
            <div className="mt-4 h-[13rem] overflow-hidden">
              <div className="flex items-center gap-4 rounded-lg bg-surface-2 p-3">
                <div className="w-20 shrink-0">
                  <p className={`text-2xl font-semibold tabular-nums ${b.cls}`}>
                    {score}
                    <span className="text-sm font-medium text-muted">/100</span>
                  </p>
                  <p className={`text-xs font-semibold ${b.cls}`}>{b.label}</p>
                </div>
                <ul className="grid min-w-0 flex-1 grid-cols-2 gap-x-3 gap-y-1.5">
                  {RUBRIC.map((r) => (
                    <li key={r.label}>
                      <div className="flex justify-between text-[0.65rem] text-muted">
                        <span>{r.label}</span>
                        <span className="tabular-nums">
                          {Math.round(r.value * progress)}/{r.max}
                        </span>
                      </div>
                      <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-line">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${(r.value / r.max) * progress * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <p className={`mt-3 text-xs leading-relaxed ${reveal(1)}`}>
                Strong diagnosis-first approach. Add how you would measure retrieval quality, and what the bot should do when the evidence is missing.
              </p>

              <div className={`mt-3 ${reveal(2)}`}>
                <p className="text-xs font-semibold">What you got right</p>
                <p className="mt-1 text-xs text-muted">Separates retrieval failures from generation failures before changing anything.</p>
              </div>

              <div className={`mt-3 ${reveal(3)}`}>
                <p className="text-xs font-semibold">What&rsquo;s missing</p>
                <ul className="mt-1 space-y-1 text-xs text-muted">
                  <li>Retrieval metrics such as recall@k, and reranking.</li>
                  <li>Letting the model say &ldquo;I don&rsquo;t know&rdquo; when evidence is absent.</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-4 text-base font-semibold leading-snug">How would you reduce hallucinations in a RAG application?</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-medium/12 px-2.5 py-0.5 font-semibold text-medium">Medium</span>
                <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-muted">RAG and Vector Databases</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Your support bot answers confidently, but sometimes with facts that are not in your documents. Walk through how you would find the cause and fix it.
              </p>
            </>
          )}
        </div>

        {/* Right: the answer editor */}
        <div className="border-t border-line sm:border-l sm:border-t-0">
          <div className="flex h-9 items-center gap-2 border-b border-line bg-surface-2 px-4 text-xs font-medium">
            <span className="text-go">&lt;/&gt;</span> Answer
          </div>

          {/* Fixed minimum height so the card doesn't jump while the text grows */}
          <div className="min-h-[12rem] p-4 font-mono text-[0.8rem] leading-relaxed">
            {finalText}
            {finalText && interimText ? ' ' : ''}
            <span className="text-muted">{interimText}</span>
            {listening && <span className="ml-0.5 inline-block h-3.5 w-0.5 translate-y-0.5 animate-pulse bg-accent" />}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
            <span className="flex min-w-0 items-center gap-3">
              {listening ? (
                <span className="inline-flex shrink-0 items-center gap-2 rounded-md bg-hard px-3 py-1.5 text-xs font-semibold text-white">
                  <span className="h-2 w-2 rounded-full bg-white" /> Stop dictating
                </span>
              ) : (
                <span className="inline-flex shrink-0 items-center gap-2 rounded-md bg-surface-2 px-3 py-1.5 text-xs font-semibold text-ink">
                  <Mic width={13} height={13} /> Dictate
                </span>
              )}
              {listening && (
                <span className="flex h-5 items-center gap-[3px]">
                  {BARS.map((d, i) => (
                    <span key={i} className="wave-bar block h-4 w-[3px] rounded-full bg-hard" style={{ animationDelay: `${d}s` }} />
                  ))}
                </span>
              )}
              {phase === 'analysing' && <span className="animate-pulse truncate text-xs text-muted">Analysing your answer…</span>}
              {showFeedback && <span className="truncate text-xs font-medium text-easy">Feedback ready</span>}
            </span>

            <span
              className={`shrink-0 rounded-md bg-go px-4 py-1.5 text-xs font-semibold text-go-ink transition-opacity ${
                phase === 'analysing' ? 'animate-pulse' : ''
              } ${showFeedback ? 'opacity-50' : ''}`}
            >
              {phase === 'analysing' ? 'Getting feedback…' : showFeedback ? 'Save & re-evaluate' : 'Submit'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}