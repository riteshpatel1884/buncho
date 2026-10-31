import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { getEntitlements } from '@/lib/subscription';
import ReportForm from '@/components/report/ReportForm';
import { KIND_LABEL, STATUS_LABEL, issueLabel } from '@/lib/support';

export const metadata = { title: 'Report a problem', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const TYPE_TO_KIND = { problem: 'PROBLEM', pro: 'PRO_PLAN', other: 'OTHER' };
const dateFmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });

const STATUS_STYLE = {
  OPEN: 'bg-medium/15 text-medium',
  RESOLVED: 'bg-accent-soft text-accent',
  DISMISSED: 'bg-surface-2 text-muted',
};

export default async function ReportPage({ searchParams }) {
  const user = await getOrCreateUser();
  if (!user) redirect(`/login?redirect_url=${encodeURIComponent('/report')}`);

  const sp = await searchParams;

  // The report buttons on a question open this page with the question already chosen
  let initialProblem = null;
  if (typeof sp.problem === 'string') {
    initialProblem = await prisma.problem.findFirst({
      where: { slug: sp.problem.slice(0, 120), published: true },
      select: { id: true, slug: true, title: true },
    });
  }
  const initialKind = TYPE_TO_KIND[String(sp.type ?? '')] ?? (initialProblem ? 'PROBLEM' : null);
  const initialIssue = typeof sp.issue === 'string' ? sp.issue.slice(0, 40) : null;

  const [ent, payments, mine] = await Promise.all([
    getEntitlements(user.id),
    prisma.payment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { orderId: true, amountPaise: true, currency: true, status: true, createdAt: true },
    }),
    prisma.supportReport.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { problem: { select: { slug: true, title: true } } },
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent">Help</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Report a problem</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Tell us what went wrong and we will look into it. Reports about a payment or your Pro plan are checked first.
      </p>

      <div className="mt-8">
        <ReportForm
          initialKind={initialKind}
          initialIssue={initialIssue}
          initialProblem={initialProblem}
          accountEmail={user.email ?? ''}
          proUntil={ent.isPro ? ent.periodEnd.toISOString() : null}
          payments={payments.map((p) => ({
            orderId: p.orderId,
            amountPaise: p.amountPaise,
            currency: p.currency,
            status: p.status,
            createdAt: p.createdAt.toISOString(),
          }))}
        />
      </div>

      {mine.length > 0 && (
        <section aria-labelledby="mine-h" className="mt-12">
          <h2 id="mine-h" className="text-lg font-semibold tracking-tight">Your reports</h2>
          <ul className="mt-4 space-y-3">
            {mine.map((r) => (
              <li key={r.id} className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">{issueLabel(r.kind, r.issue)}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {KIND_LABEL[r.kind]} · {dateFmt(r.createdAt)} · Ref {r.id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[r.status]}`}>
                    {STATUS_LABEL[r.status]}
                  </span>
                </div>
                {r.problem && (
                  <p className="mt-2 text-sm">
                    <Link href={`/problems/${r.problem.slug}`} className="text-accent underline underline-offset-4">{r.problem.title}</Link>
                  </p>
                )}
                {r.adminNote && (
                  <p className="mt-3 rounded-xl bg-accent-soft px-3.5 py-2.5 text-sm">
                    <span className="font-semibold">Reply from Buncho: </span>
                    {r.adminNote}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}