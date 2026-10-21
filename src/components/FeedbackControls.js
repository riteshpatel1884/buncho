'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { requestFeedback } from '@/lib/ai-client';

export default function FeedbackControls({ problemId, label = 'Get AI feedback' }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  async function run() {
    setPending(true);
    setError(null);
    const res = await requestFeedback(problemId);
    setPending(false);
    if (res.ok) router.refresh();
    else setError(res.error);
  }

  return (
    <div>
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink hover:opacity-90 disabled:opacity-50"
      >
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