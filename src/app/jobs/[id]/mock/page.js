import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import Markdown from '@/components/Markdown';
import MockRunner from '@/components/jobs/MockRunner';
import { ctaBtn } from '@/components/jobs/ui';
import { Flask } from '@/components/icons';

export const metadata = { title: 'Mock assessment' };

export default async function MockPage({ params }) {
  const user = await getOrCreateUser();
  if (!user) redirect('/login');
  const { id } = await params;

  const mock = await prisma.mockAssessment.findFirst({
    where: { jobId: id, userId: user.id, status: 'IN_PROGRESS' },
    orderBy: { startedAt: 'desc' },
  });
  if (!mock) {
    const job = await prisma.jobTarget.findFirst({ where: { id, userId: user.id }, select: { id: true } });
    if (!job) notFound();
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-line p-8 text-center sm:p-12" style={{ background: 'linear-gradient(135deg, var(--accent-soft), var(--surface) 65%)' }}>
          <div aria-hidden="true" className="pointer-events-none absolute -left-10 -top-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent text-accent-ink shadow-lg shadow-accent/30"><Flask width={28} height={28} /></span>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">No mock in progress</h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">Start a mock assessment from your role page and it will appear here with a timer.</p>
            <Link href={`/jobs/${id}`} className={`${ctaBtn} mt-6`}>Back to role</Link>
          </div>
        </div>
      </div>
    );
  }

  const rows = await prisma.problem.findMany({
    where: { id: { in: mock.problemIds } },
    select: { id: true, title: true, description: true, difficulty: true, estimatedMinutes: true, topic: { select: { name: true } } },
  });
  const order = new Map(mock.problemIds.map((pid, i) => [pid, i]));
  rows.sort((a, b) => order.get(a.id) - order.get(b.id));

  const questions = rows.map((p) => ({
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
    topic: p.topic.name,
    minutes: p.estimatedMinutes,
    body: <Markdown>{p.description}</Markdown>,
  }));

  const endsAt = new Date(mock.startedAt.getTime() + mock.durationMinutes * 60000).toISOString();
  return <MockRunner mockId={mock.id} jobId={id} endsAt={endsAt} questions={questions} />;
}