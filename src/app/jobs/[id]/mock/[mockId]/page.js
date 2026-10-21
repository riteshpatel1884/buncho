import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { getSkill } from '@/lib/jobs/skills';
import { Bar } from '@/components/jobs/Parts';

export const metadata = { title: 'Mock assessment results' };

const STATE = { scored: null, skipped: 'Not answered, counted as 0', 'no-feedback': 'AI feedback unavailable, not counted' };

export default async function MockResultPage({ params }) {
  const user = await getOrCreateUser();
  if (!user) redirect('/login');
  const { id, mockId } = await params;

  const mock = await prisma.mockAssessment.findFirst({
    where: { id: mockId, jobId: id, userId: user.id },
    include: { job: { select: { title: true } } },
  });
  if (!mock) notFound();
  if (mock.status !== 'COMPLETED' || !mock.results) redirect(`/jobs/${id}/mock`);

  const previous = await prisma.mockAssessment.findFirst({
    where: { jobId: id, userId: user.id, status: 'COMPLETED', completedAt: { lt: mock.completedAt }, score: { not: null } },
    orderBy: { completedAt: 'desc' },
    select: { score: true },
  });

  const { questions, partial } = mock.results;
  const slugs = Object.fromEntries((await prisma.problem.findMany({ where: { id: { in: mock.problemIds } }, select: { id: true, slug: true } })).map((p) => [p.id, p.slug]));

  // Per-skill averages from the questions that were scored
  const bySkill = new Map();
  questions.filter((q) => q.score !== null).forEach((q) => q.skillKeys.forEach((k) => {
    const e = bySkill.get(k) ?? { sum: 0, n: 0 };
    e.sum += q.score;
    e.n += 1;
    bySkill.set(k, e);
  }));
  const skills = [...bySkill.entries()].map(([k, e]) => ({ key: k, label: getSkill(k)?.label ?? k, avg: Math.round(e.sum / e.n) })).sort((a, b) => a.avg - b.avg);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8 sm:px-6">
      <Link href={`/jobs/${id}`} className="text-sm text-muted hover:text-ink">← {mock.job.title}</Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Mock assessment results</h1>

      <section className="panel mt-6 p-6 text-center">
        <p className="text-5xl font-semibold tabular-nums">{mock.score ?? '—'}<span className="text-lg font-normal text-muted">{mock.score !== null ? '/100' : ''}</span></p>
        {previous && mock.score !== null && (
          <p className="mt-1 text-sm text-muted">
            {mock.score === previous.score ? 'Same as' : mock.score > previous.score ? `Up ${mock.score - previous.score} from` : `Down ${previous.score - mock.score} from`} your previous mock ({previous.score}/100)
          </p>
        )}
        {partial && <p className="mx-auto mt-3 max-w-md rounded-lg bg-medium/12 px-3 py-2 text-xs text-medium">AI feedback failed for some answers, so this score covers only the questions that were evaluated. Open those questions to retry feedback.</p>}
        <p className="mx-auto mt-3 max-w-md text-xs text-muted">This is a practice indicator from AI feedback on your answers. It does not predict how an interview will go.</p>
      </section>

      {skills.length > 0 && (
        <section className="panel mt-4 p-5">
          <h2 className="text-base font-semibold">By skill</h2>
          <p className="text-xs text-muted">Weakest first.</p>
          <ul className="mt-4 space-y-3">
            {skills.map((s) => (
              <li key={s.key}>
                <div className="flex justify-between text-sm"><span className="font-medium">{s.label}</span><span className="tabular-nums text-muted">{s.avg}/100</span></div>
                <div className="mt-1.5"><Bar value={s.avg} label={`${s.label} score`} /></div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="panel mt-4 p-5">
        <h2 className="text-base font-semibold">Questions</h2>
        <ul className="-mx-2 mt-3 space-y-0.5">
          {questions.map((q, i) => (
            <li key={q.problemId}>
              <Link href={`/problems/${slugs[q.problemId] ?? ''}`} className="flex items-center justify-between gap-4 rounded-lg px-3 py-3 text-sm odd:bg-surface-2/70 hover:bg-surface-2">
                <span className="min-w-0">
                  <span className="block truncate font-medium"><span className="mr-1.5 tabular-nums text-muted">{i + 1}.</span>{q.title}</span>
                  <span className="block text-xs text-muted">{STATE[q.state] ?? 'View feedback and the expert solution'}</span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums">{q.score !== null ? `${q.score}/100` : '—'}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/jobs/${id}`} className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-ink hover:opacity-90">Back to practice plan</Link>
      </div>
    </div>
  );
}