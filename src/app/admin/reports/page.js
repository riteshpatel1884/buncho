import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { isAdmin } from '@/lib/admin';
import { moderateAnswer } from '@/app/community-actions';
import { REPORT_REASON_LABEL } from '@/lib/constants';
import Markdown from '@/components/Markdown';
import PendingButton from '@/components/PendingButton';

export const metadata = { title: 'Reported answers' };
export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const user = await getOrCreateUser();
  if (!isAdmin(user)) notFound(); // don't reveal that the page exists

  const answers = await prisma.communityAnswer.findMany({
    where: { reports: { some: { status: 'OPEN' } } },
    orderBy: { updatedAt: 'asc' },
    select: {
      id: true,
      content: true,
      status: true,
      problem: { select: { slug: true, title: true } },
      user: { select: { name: true, email: true } },
      reports: {
        where: { status: 'OPEN' },
        orderBy: { createdAt: 'asc' },
        select: { id: true, reason: true, details: true, createdAt: true },
      },
    },
  });

  const danger = 'rounded-lg bg-hard px-4 py-2.5 text-sm font-semibold text-white';
  const neutral = 'rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-semibold hover:bg-surface-2';

  return (
    <div className="wrap max-w-4xl py-10 lg:py-14">
      <h1 className="text-2xl font-semibold tracking-tight">Reported answers</h1>
      <p className="mt-2 text-muted">
        {answers.length
          ? `${answers.length} answer${answers.length > 1 ? 's' : ''} with open reports.`
          : 'Nothing to review right now.'}
      </p>

      <ul className="mt-8 space-y-8">
        {answers.map((a) => (
          <li key={a.id} className="rounded-lg border border-line bg-surface">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3 text-sm">
              <Link href={`/problems/${a.problem.slug}`} className="font-semibold text-accent underline underline-offset-4">
                {a.problem.title}
              </Link>
              <span className="text-muted">
                By {a.user.name ?? a.user.email ?? 'unknown'} ·{' '}
                {a.status === 'HIDDEN' ? 'currently hidden' : a.status === 'UNSHARED' ? 'author stopped sharing' : 'currently public'}
              </span>
            </div>

            <div className="px-5 py-5">
              <Markdown>{a.content}</Markdown>
            </div>

            <ul className="space-y-2 border-t border-line px-5 py-4 text-sm">
              {a.reports.map((r) => (
                <li key={r.id}>
                  <span className="font-semibold">{REPORT_REASON_LABEL[r.reason]}</span>
                  {r.details && <span className="text-muted">: {r.details}</span>}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3 border-t border-line px-5 py-4">
              <form action={moderateAnswer.bind(null, a.id, 'hide')}>
                <PendingButton className={danger} pendingLabel="Hiding…">Hide answer</PendingButton>
              </form>
              <form action={moderateAnswer.bind(null, a.id, 'dismiss')}>
                <PendingButton className={neutral} pendingLabel="Dismissing…">
                  Dismiss reports{a.status === 'HIDDEN' ? ' and restore' : ''}
                </PendingButton>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}