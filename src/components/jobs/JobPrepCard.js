import Link from 'next/link';
import { Bar } from './Parts';

export default function JobPrepCard({ jobs }) {
  return (
    <section aria-labelledby="jobs-h" className="panel p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 id="jobs-h" className="text-base font-semibold">Job preparation</h2>
        <Link href="/jobs" className="text-xs font-semibold text-accent hover:underline">{jobs.length ? 'All roles' : 'Get started'}</Link>
      </div>
      {jobs.length ? (
        <ul className="mt-3 space-y-4">
          {jobs.map((j) => {
            const pct = j.total ? Math.round((j.completed / j.total) * 100) : 0;
            return (
              <li key={j.id}>
                <Link href={`/jobs/${j.id}`} className="flex items-baseline justify-between gap-3 text-sm hover:text-accent">
                  <span className="min-w-0 truncate font-medium">{j.title}{j.company && <span className="font-normal text-muted"> · {j.company}</span>}</span>
                  <span className="shrink-0 text-xs text-muted">{j.completed}/{j.total}</span>
                </Link>
                <div className="mt-1.5"><Bar value={pct} label={`${j.title} plan progress`} /></div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted">Applying to a specific role? Paste the job description and get a practice plan built from the question bank.</p>
      )}
    </section>
  );
}