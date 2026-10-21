'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteJobTarget, regeneratePlan, startMock } from '@/app/job-actions';

const btn = 'rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-50';

export function StartMockButton({ jobId, resume = false, disabledReason = null }) {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [pending, start] = useTransition();

  function go() {
    if (resume) return router.push(`/jobs/${jobId}/mock`);
    setError(null);
    start(async () => {
      const res = await startMock(jobId);
      if (!res.ok) return setError(res.error);
      router.push(`/jobs/${jobId}/mock`);
    });
  }

  return (
    <div>
      <button type="button" onClick={go} disabled={pending || Boolean(disabledReason)} className={`${btn} bg-accent text-accent-ink hover:opacity-90`}>
        {pending ? 'Preparing…' : resume ? 'Resume mock assessment' : 'Start mock assessment'}
      </button>
      {(error || disabledReason) && <p role="alert" className="mt-2 text-xs text-hard">{error ?? disabledReason}</p>}
    </div>
  );
}

export function ManageRole({ jobId }) {
  const router = useRouter();
  const [msg, setMsg] = useState(null);
  const [pending, start] = useTransition();

  function regenerate() {
    setMsg(null);
    start(async () => {
      const res = await regeneratePlan(jobId);
      setMsg(res.ok ? 'Plan refreshed with the latest questions.' : res.error);
      router.refresh();
    });
  }

  function remove() {
    if (!window.confirm('Delete this role and its plan? Your answers and progress on the questions are kept.')) return;
    start(async () => {
      await deleteJobTarget(jobId);
      router.push('/jobs');
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={regenerate} disabled={pending} className={`${btn} bg-surface-2 hover:bg-line`}>Refresh plan</button>
      <button type="button" onClick={remove} disabled={pending} className={`${btn} text-hard hover:bg-hard/10`}>Delete role</button>
      {msg && <span role="status" className="text-xs text-muted">{msg}</span>}
    </div>
  );
}