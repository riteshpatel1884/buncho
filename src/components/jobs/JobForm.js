'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createJobTarget } from '@/app/job-actions';
import { JD_MAX_LENGTH, JD_MIN_LENGTH } from '@/lib/constants';

const field = 'w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-sm outline-none focus:border-accent';

export default function JobForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jd, setJd] = useState('');
  const [error, setError] = useState(null);
  const [pending, startTransition] = useTransition();

  function submit(e) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createJobTarget({ title, company, jdText: jd });
      if (!res.ok) return setError(res.error);
      router.push(`/jobs/${res.id}`);
    });
  }

  const short = jd.trim().length < JD_MIN_LENGTH;

  return (
    <form onSubmit={submit} className="panel space-y-4 p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="job-title" className="text-sm font-medium">Role title <span className="font-normal text-muted">(optional)</span></label>
          <input id="job-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="GenAI Engineer Intern" className={`${field} mt-1.5`} />
        </div>
        <div>
          <label htmlFor="job-company" className="text-sm font-medium">Company <span className="font-normal text-muted">(optional)</span></label>
          <input id="job-company" value={company} onChange={(e) => setCompany(e.target.value)} maxLength={80} placeholder="Acme AI" className={`${field} mt-1.5`} />
        </div>
      </div>

      <div>
        <label htmlFor="job-jd" className="text-sm font-medium">Job description</label>
        <textarea
          id="job-jd"
          value={jd}
          onChange={(e) => setJd(e.target.value.slice(0, JD_MAX_LENGTH))}
          rows={14}
          placeholder="Paste the full job description here, including the responsibilities and requirements sections."
          className={`${field} mt-1.5 resize-y leading-relaxed`}
        />
        <p className="mt-1 text-right text-xs text-muted tabular-nums">{jd.length.toLocaleString()} / {JD_MAX_LENGTH.toLocaleString()}</p>
      </div>

      {error && <p role="alert" className="rounded-lg bg-hard/10 px-3 py-2 text-sm text-hard">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending || short}
          className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-ink hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Reading job description…' : 'Build my practice plan'}
        </button>
        <p className="text-xs text-muted">Your job description stays private to your account.</p>
      </div>
    </form>
  );
}