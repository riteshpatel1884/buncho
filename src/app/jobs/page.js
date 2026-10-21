import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getOrCreateUser } from '@/lib/user';
import { listJobs } from '@/lib/jobs/progress';
import { MAX_JOB_TARGETS } from '@/lib/constants';
import { Bar } from '@/components/jobs/Parts';

export const metadata = { title: 'Job preparation' };

export default async function JobsPage() {
  const user = await getOrCreateUser();
  if (!user) redirect('/login');
  const jobs = await listJobs(user.id);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-8 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Job preparation</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Prepare for a specific role</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Paste a job description. Buncho reads the skills it asks for, matches them to the reviewed question bank and builds a practice plan you can track.
          </p>
        </div>
        {jobs.length < MAX_JOB_TARGETS && (
          <Link href="/jobs/new" className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-ink hover:opacity-90">Add a role</Link>
        )}
      </header>

      {jobs.length ? (
        <ul className="mt-8 space-y-3">
          {jobs.map((j) => {
            const pct = j.total ? Math.round((j.completed / j.total) * 100) : 0;
            return (
              <li key={j.id}>
                <Link href={`/jobs/${j.id}`} className="panel block p-5 transition-colors hover:bg-surface-2/60">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="text-base font-semibold">{j.title}{j.company && <span className="font-normal text-muted"> · {j.company}</span>}</h2>
                    <span className="text-xs text-muted">{j.skillCount} skills · {j.completed}/{j.total} questions done</span>
                  </div>
                  <div className="mt-3"><Bar value={pct} label={`${j.title} plan progress`} /></div>
                  {j.lastMockScore !== null && <p className="mt-2 text-xs text-muted">Last mock assessment: <span className="font-semibold text-ink">{j.lastMockScore}/100</span></p>}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="panel mt-8 p-8 text-center">
          <p className="font-semibold">No roles yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted">Add the first job or internship you are applying to and get a plan built from questions you can practise right now.</p>
          <Link href="/jobs/new" className="mt-4 inline-block rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-ink hover:opacity-90">Paste a job description</Link>
        </div>
      )}
    </div>
  );
}