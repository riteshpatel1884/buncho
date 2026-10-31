import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { isAdmin } from '@/lib/admin';
import { KIND_LABEL, STATUS_LABEL, SUPPORT_KINDS, issueLabel } from '@/lib/support';
import { formatMoney } from '@/lib/money';
import PendingButton from '@/components/PendingButton';
import { updateSupportReport } from './actions';

export const metadata = { title: 'Reports' };
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;
const STATUS_FILTERS = ['OPEN', 'RESOLVED', 'DISMISSED', 'ALL'];

const dateTime = (d) => d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
const dateOnly = (d) => d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' });

const KIND_STYLE = {
  PROBLEM: 'bg-accent-soft text-accent',
  PRO_PLAN: 'bg-amber-400/20 text-amber-700 dark:text-amber-300',
  OTHER: 'bg-surface-2 text-muted',
};
const STATUS_STYLE = {
  OPEN: 'bg-medium/15 text-medium',
  RESOLVED: 'bg-accent-soft text-accent',
  DISMISSED: 'bg-surface-2 text-muted',
};

const input =
  'rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15';
const primary = 'rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink hover:opacity-90';
const neutral = 'rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold hover:bg-surface-2';

function hrefFor(params) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v && v !== 1) sp.set(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `/admin/reports?${qs}` : '/admin/reports';
}

export default async function ReportsPage({ searchParams }) {
  const me = await getOrCreateUser();
  if (!isAdmin(me)) notFound(); // don't reveal that the page exists

  const sp = await searchParams;
  const status = STATUS_FILTERS.includes(sp.status) ? sp.status : 'OPEN';
  const kind = SUPPORT_KINDS.includes(sp.kind) ? sp.kind : 'ALL';
  const page = Math.max(1, parseInt(sp.page, 10) || 1);

  return (
    <div className="wrap max-w-4xl py-10 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="mt-1 text-sm text-muted">Problems, Pro plan and payment issues reported by users.</p>
        </div>
        <Link href="/admin" className="text-sm font-semibold text-accent underline underline-offset-4">Admin home</Link>
      </div>

      <SupportTab status={status} kind={kind} page={page} />
    </div>
  );
}

/* ---------- Reports sent from the /report page ---------- */

async function SupportTab({ status, kind, page }) {
  const where = {
    ...(status !== 'ALL' && { status }),
    ...(kind !== 'ALL' && { kind }),
  };

  const [total, reports] = await Promise.all([
    prisma.supportReport.count({ where }),
    prisma.supportReport.findMany({
      where,
      orderBy: { createdAt: status === 'OPEN' ? 'asc' : 'desc' }, // oldest open report first
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { name: true, email: true, subscription: { select: { currentPeriodEnd: true } } } },
        problem: { select: { slug: true, title: true } },
      },
    }),
  ]);

  // Check the transaction IDs people typed against our own payments (our order id, Cashfree id or Dodo id)
  const txIds = [...new Set(reports.map((r) => r.transactionId).filter(Boolean))];
  const userIds = [...new Set(reports.filter((r) => r.kind === 'PRO_PLAN').map((r) => r.userId))];
  const [matched, recent] = await Promise.all([
    txIds.length
      ? prisma.payment.findMany({
          where: { OR: [{ orderId: { in: txIds } }, { cfPaymentId: { in: txIds } }, { dodoPaymentId: { in: txIds } }] },
          select: {
            orderId: true,
            cfPaymentId: true,
            dodoPaymentId: true,
            status: true,
            amountPaise: true,
            currency: true,
            createdAt: true,
            userId: true,
          },
        })
      : [],
    userIds.length
      ? prisma.payment.findMany({
          where: { userId: { in: userIds } },
          orderBy: { createdAt: 'desc' },
          take: 100,
          select: { orderId: true, status: true, amountPaise: true, currency: true, createdAt: true, userId: true },
        })
      : [],
  ]);
  const matchBy = new Map();
  matched.forEach((p) => {
    matchBy.set(p.orderId, p);
    if (p.cfPaymentId) matchBy.set(p.cfPaymentId, p);
    if (p.dodoPaymentId) matchBy.set(p.dodoPaymentId, p);
  });
  const recentBy = new Map();
  recent.forEach((p) => {
    const list = recentBy.get(p.userId) ?? [];
    if (list.length < 3) list.push(p);
    recentBy.set(p.userId, list);
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const base = { tab: 'support', status: status === 'OPEN' ? '' : status, kind: kind === 'ALL' ? '' : kind };
  const now = new Date();

  return (
    <div className="mt-6">
      <form action="/admin/reports" className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="tab" value="support" />
        <div>
          <label htmlFor="status" className="text-xs font-medium text-muted">Status</label>
          <select id="status" name="status" defaultValue={status} className={`${input} mt-1.5 block`}>
            <option value="OPEN">Open</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DISMISSED">Closed</option>
            <option value="ALL">All</option>
          </select>
        </div>
        <div>
          <label htmlFor="kind" className="text-xs font-medium text-muted">Type</label>
          <select id="kind" name="kind" defaultValue={kind} className={`${input} mt-1.5 block`}>
            <option value="ALL">All types</option>
            {SUPPORT_KINDS.map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
          </select>
        </div>
        <button type="submit" className={primary}>Apply</button>
        <p className="ml-auto text-sm text-muted" role="status">{total} report{total === 1 ? '' : 's'}</p>
      </form>

      {reports.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">
          {status === 'OPEN' ? 'No open reports. Nothing to review right now.' : 'No reports match those filters.'}
        </p>
      ) : (
        <ul className="mt-6 space-y-6">
          {reports.map((r) => {
            const proActive = r.user.subscription && r.user.subscription.currentPeriodEnd > now;
            const match = r.transactionId ? matchBy.get(r.transactionId) : null;
            const lastPayments = recentBy.get(r.userId) ?? [];
            return (
              <li key={r.id} className="rounded-2xl border border-line bg-surface">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${KIND_STYLE[r.kind]}`}>{KIND_LABEL[r.kind]}</span>
                    <span className="text-sm font-semibold">{issueLabel(r.kind, r.issue)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span>{dateTime(r.createdAt)} · Ref {r.id.slice(-8).toUpperCase()}</span>
                    <span className={`rounded-full px-2.5 py-0.5 font-semibold ${STATUS_STYLE[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                  </div>
                </div>

                <div className="space-y-4 px-5 py-4 text-sm">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>
                      <span className="font-medium">{r.user.name ?? 'No name'}</span>{' '}
                      <span className="text-muted">{r.user.email ?? ''}</span>
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${proActive ? 'bg-accent-soft text-accent' : 'bg-surface-2 text-muted'}`}>
                      {proActive ? `Pro until ${dateOnly(r.user.subscription.currentPeriodEnd)}` : 'Not Pro'}
                    </span>
                    {r.contactEmail && r.contactEmail !== r.user.email && <span className="text-muted">Contact: {r.contactEmail}</span>}
                  </div>

                  {r.problem && (
                    <p>
                      Question:{' '}
                      <Link href={`/problems/${r.problem.slug}`} className="font-semibold text-accent underline underline-offset-4">
                        {r.problem.title}
                      </Link>
                    </p>
                  )}

                  <p className="whitespace-pre-wrap break-words rounded-xl bg-surface-2/60 px-4 py-3">{r.details}</p>

                  {r.kind === 'PRO_PLAN' && (
                    <div className="space-y-2 rounded-xl border border-line px-4 py-3">
                      <p>
                        Transaction ID:{' '}
                        {r.transactionId ? <span className="font-mono font-semibold">{r.transactionId}</span> : <span className="text-muted">not given</span>}
                      </p>
                      {r.transactionId &&
                        (match ? (
                          <p className={match.userId === r.userId ? 'text-easy' : 'font-semibold text-hard'}>
                            Matches our order {match.orderId}: {match.status}, {formatMoney(match.amountPaise, match.currency)}, {dateOnly(match.createdAt)}
                            {match.userId !== r.userId && ' (this order belongs to a different account!)'}
                          </p>
                        ) : (
                          <p className="text-muted">No order with this ID in our records. It may be a bank or UPI reference.</p>
                        ))}
                      {lastPayments.length > 0 && (
                        <p className="text-xs text-muted">
                          Their latest orders:{' '}
                          {lastPayments.map((p) => `${p.orderId} (${p.status}, ${formatMoney(p.amountPaise, p.currency)})`).join(' · ')}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <form action={updateSupportReport} className="space-y-3 border-t border-line px-5 py-4">
                  <input type="hidden" name="id" value={r.id} />
                  <div>
                    <label htmlFor={`note-${r.id}`} className="text-xs font-medium text-muted">Reply to the user (shown on their report page)</label>
                    <textarea
                      id={`note-${r.id}`}
                      name="adminNote"
                      rows={2}
                      maxLength={1000}
                      defaultValue={r.adminNote ?? ''}
                      className={`${input} mt-1.5 w-full resize-y`}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {r.status !== 'RESOLVED' && <PendingButton name="status" value="RESOLVED" className={primary}>Mark resolved</PendingButton>}
                    {r.status !== 'DISMISSED' && <PendingButton name="status" value="DISMISSED" className={neutral}>Close without fix</PendingButton>}
                    {r.status !== 'OPEN' && <PendingButton name="status" value="OPEN" className={neutral}>Reopen</PendingButton>}
                    <PendingButton name="status" value={r.status} className={neutral}>Save note only</PendingButton>
                  </div>
                </form>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-8 flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link href={hrefFor({ ...base, page: page - 1 })} className="rounded-md border border-line bg-surface px-4 py-2 font-medium hover:bg-surface-2">Previous</Link>
          ) : <span />}
          <span className="text-muted">Page {page} of {totalPages}</span>
          {page < totalPages ? (
            <Link href={hrefFor({ ...base, page: page + 1 })} className="rounded-md border border-line bg-surface px-4 py-2 font-medium hover:bg-surface-2">Next</Link>
          ) : <span />}
        </nav>
      )}
    </div>
  );
}