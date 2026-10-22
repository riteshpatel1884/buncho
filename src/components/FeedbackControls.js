'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { requestFeedback } from '@/lib/ai-client';
import Spinner from './Spinner';

export default function FeedbackControls({ problemId, label = 'Get AI feedback' }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  async function run() {
    setPending(true);
    setError(null);
    const res = await requestFeedback(problemId);
    if (res.ok) router.refresh();
    else setError(res.error);
    setPending(false);
  }

  return (
    <div>
      <button
        type="button"
        onClick={run}
        disabled={pending}
        aria-busy={pending}
        className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink hover:opacity-90 disabled:cursor-wait disabled:opacity-50"
      >
        {pending && <Spinner size={14} />}
        {pending ? 'Analysing your answer…' : label}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-hard">
          {error}
        </p>
      )}
    </div>
  );
}