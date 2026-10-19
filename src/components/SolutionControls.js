'use client';

import { useState, useTransition } from 'react';
import { revealSolution, setCompleted } from '@/app/actions';

export function RevealButton({ problemId }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState(null);

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await revealSolution(problemId);
            if (!res.ok) setError(res.error);
          })
        }
        className="rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-semibold hover:bg-surface-2 disabled:opacity-50"
      >
        {pending ? 'Revealing…' : 'Reveal without answering'}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-hard">{error}</p>}
    </div>
  );
}

export function CompleteToggle({ problemId, completed }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState(null);

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await setCompleted(problemId, !completed);
            if (!res.ok) setError(res.error);
          })
        }
        className={`rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-50 ${
          completed ? 'border border-line bg-surface hover:bg-surface-2' : 'bg-accent text-accent-ink'
        }`}
      >
        {pending ? 'Saving…' : completed ? 'Mark as not completed' : 'Mark as completed'}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-hard">{error}</p>}
    </div>
  );
}
