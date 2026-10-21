import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import Markdown from '@/components/Markdown';
import MockRunner from '@/components/jobs/MockRunner';

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
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">No mock in progress</h1>
        <p className="mt-2 text-sm text-muted">Start a mock assessment from your role page.</p>
        <Link href={`/jobs/${id}`} className="mt-4 inline-block rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-ink">Back to role</Link>
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