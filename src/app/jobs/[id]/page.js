import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getOrCreateUser } from '@/lib/user';
import { getJobDetail } from '@/lib/jobs/progress';
import { Bar, PlanRow, SkillRow } from '@/components/jobs/Parts';
import { ManageRole, StartMockButton } from '@/components/jobs/JobActions';
import { MOCK_MIN_QUESTIONS } from '@/lib/constants';

export const metadata = { title: 'Role preparation' };

export default async function JobPage({ params }) {
  const user = await getOrCreateUser();
  if (!user) redirect('/login');
  const { id } = await params;
  const data = await getJobDetail(user.id, id);
  if (!data) notFound();

  const { job, plan, skills, gaps, mocks, summary, next } = data;
  const skillLabels = Object.fromEntries(skills.map((s) => [s.key, s.label]));
  const pct = summary.total ? Math.round((summary.completed / summary.total) * 100) : 0;
  const open = mocks.find((m) => m.status === 'IN_PROGRESS');
  const finished = mocks.filter((m) => m.status === 'COMPLETED');
  const typed = plan.filter((p) => !p.problem.isChallenge).length;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-8 sm:px-6">
      <Link href="/jobs" className="text-sm text-muted hover:text-ink">← Job preparation</Link>
      <header className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{job.title}</h1>
          {job.company && <p className="mt-1 text-muted">{job.company}</p>}
        </div>
        <ManageRole jobId={job.id} />
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <section aria-labelledby="progress-h" className="panel p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="progress-h" className="text-base font-semibold">Plan progress</h2>
              <span className="text-sm text-muted">{summary.completed} of {summary.total} completed · about {summary.minutesLeft} min left</span>
            </div>
            <div className="mt-3"><Bar value={pct} label="Plan completion" /></div>

            <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-line pt-4">
              <div>
                <p className="text-xs text-muted">Role readiness {summary.provisional && summary.score !== null && <span className="ml-1 rounded-full bg-medium/12 px-2 py-0.5 font-semibold text-medium">Early estimate</span>}</p>
                <p className="text-2xl font-semibold tabular-nums">{summary.score ?? '—'}<span className="text-sm font-normal text-muted">{summary.score !== null ? '/100' : ''}</span></p>
                <p className="text-xs text-muted">{summary.label}</p>
              </div>
              {next && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted">Up next</p>
                  <Link href={`/problems/${next.problem.slug}`} className="block truncate font-medium text-accent hover:underline">{next.problem.title}</Link>
                  <p className="text-xs text-muted">{next.reason}</p>
                </div>
              )}
            </div>
            <details className="mt-4 text-sm">
              <summary className="cursor-pointer font-semibold">How is role readiness calculated?</summary>
              <p className="mt-2 text-muted">
                It is the weighted average of your skill scores, where each skill score is the average AI feedback score of your latest answers to plan questions for that skill. Core skills weigh three times more than nice-to-haves, and a skill is scaled down until you have answered a few questions for it. Skills the question bank cannot test yet are left out. It is a practice indicator, not a prediction of interview results.
              </p>
            </details>
          </section>

          <section aria-labelledby="plan-h" className="panel p-5">
            <h2 id="plan-h" className="text-base font-semibold">Practice plan</h2>
            <p className="mt-0.5 text-xs text-muted">Ordered from the skills this job asks for most, easier questions first.</p>
            <ol className="-mx-2 mt-3 space-y-0.5">
              {plan.map((item, i) => <PlanRow key={item.id} item={item} number={i + 1} skillLabels={skillLabels} />)}
            </ol>
          </section>
        </div>

        <aside className="space-y-4">
          <section aria-labelledby="skills-h" className="panel p-5">
            <h2 id="skills-h" className="text-base font-semibold">Skills in this job</h2>
            <ul className="mt-4 space-y-4">{skills.map((s) => <SkillRow key={s.key} skill={s} />)}</ul>
            {gaps.length > 0 && (
              <p className="mt-4 rounded-lg bg-surface-2 p-3 text-xs text-muted">
                <span className="font-semibold text-ink">Not covered yet:</span> {gaps.map((g) => g.label).join(', ')}. The question bank has no matching questions for these, so they are not part of your plan or readiness score.
              </p>
            )}
          </section>

          <section aria-labelledby="mock-h" className="panel p-5">
            <h2 id="mock-h" className="text-base font-semibold">Mock assessment</h2>
            <p className="mt-1 text-sm text-muted">
              A timed set of questions across this job&rsquo;s main skills, with AI feedback at the end. It uses questions you haven&rsquo;t answered yet when possible. If it picks one you already answered, your new answer replaces the old one.
            </p>
            <div className="mt-4">
              <StartMockButton
                jobId={job.id}
                resume={Boolean(open)}
                disabledReason={typed < MOCK_MIN_QUESTIONS ? `Needs at least ${MOCK_MIN_QUESTIONS} written questions in the plan.` : null}
              />
            </div>
            {open && <p className="mt-2 text-xs text-muted">You have a mock in progress.</p>}
            {finished.length > 0 && (
              <ul className="mt-4 space-y-1 border-t border-line pt-3 text-sm">
                {finished.map((m) => (
                  <li key={m.id}>
                    <Link href={`/jobs/${job.id}/mock/${m.id}`} className="flex justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-surface-2">
                      <span className="text-muted">{m.completedAt?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      <span className="font-semibold tabular-nums">{m.score !== null ? `${m.score}/100` : 'No score'}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}