import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { isAdmin } from '@/lib/admin';
import { AD_SLOTS, usd } from '@/lib/ads';
import AdCard from '@/components/ads/AdCard';
import PendingButton from '@/components/PendingButton';
import { approveAd, endAd, rejectAd } from './actions';

export const metadata = {
  title: 'Sponsor ads',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};
export const dynamic = 'force-dynamic';

const TABS = [
  { id: 'awaiting', label: 'Awaiting approval' },
  { id: 'live', label: 'Live' },
  { id: 'unpaid', label: 'Unpaid attempts' },
  { id: 'past', label: 'Past' },
  { id: 'all', label: 'All' },
];

const dateTime = (d) => d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
const dateOnly = (d) => d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' });

const input = 'w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15';
const primary = 'rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink hover:opacity-90';
const danger = 'rounded-lg bg-hard px-4 py-2 text-sm font-semibold text-white hover:opacity-90';
const neutral = 'rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold hover:bg-surface-2';

function whereFor(tab, now) {
  switch (tab) {
    case 'awaiting': return { status: 'PAID' };
    case 'live': return { status: 'APPROVED', endsAt: { gt: now } };
    case 'unpaid': return { status: { in: ['PENDING_PAYMENT', 'FAILED'] } };
    case 'past': return { OR: [{ status: { in: ['REJECTED', 'ENDED'] } }, { status: 'APPROVED', endsAt: { lte: now } }] };
    default: return {};
  }
}

function statusLabel(ad, now) {
  if (ad.status === 'APPROVED') return ad.endsAt && ad.endsAt <= now ? ['Ended', 'bg-surface-2 text-muted'] : ['Live', 'bg-go/15 text-go'];
  return {
    PAID: ['Awaiting approval', 'bg-medium/15 text-medium'],
    PENDING_PAYMENT: ['Not paid', 'bg-surface-2 text-muted'],
    FAILED: ['Checkout failed', 'bg-hard/15 text-hard'],
    REJECTED: ['Rejected', 'bg-hard/15 text-hard'],
    ENDED: ['Taken down', 'bg-surface-2 text-muted'],
  }[ad.status];
}

function Row({ label, children }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-4 gap-y-0.5 py-1.5 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="min-w-0 break-all text-right font-medium">{children ?? '—'}</dd>
    </div>
  );
}

export default async function AdminAdsPage({ searchParams }) {
  const me = await getOrCreateUser();
  if (!isAdmin(me)) notFound(); // don't reveal that the page exists

  const sp = await searchParams;
  const tab = TABS.some((t) => t.id === sp?.tab) ? sp.tab : 'awaiting';
  const now = new Date();

  const [awaiting, live, ads] = await Promise.all([
    prisma.adBooking.count({ where: whereFor('awaiting', now) }),
    prisma.adBooking.count({ where: whereFor('live', now) }),
    prisma.adBooking.findMany({
      where: whereFor(tab, now),
      orderBy: { createdAt: tab === 'awaiting' ? 'asc' : 'desc' }, // oldest waiting first
      take: 100,
      include: {
        user: { select: { id: true, name: true, email: true, imageUrl: true, createdAt: true, _count: { select: { adBookings: true } } } },
      },
    }),
  ]);

  const counts = { awaiting, live };
  const ok = typeof sp?.ok === 'string' ? sp.ok : null;
  const error = typeof sp?.error === 'string' ? sp.error : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sponsor ads</h1>
          <p className="mt-1 text-sm text-muted">People who paid for a banner on /problems. Approve a banner to put it live for one month.</p>
        </div>
        <Link href="/admin" className="text-sm font-semibold text-accent underline underline-offset-4">Admin home</Link>
      </div>

      {ok && <p role="status" className="mt-5 rounded-xl bg-go/15 px-4 py-3 text-sm font-medium">{ok}</p>}
      {error && <p role="alert" className="mt-5 rounded-xl bg-hard/10 px-4 py-3 text-sm font-medium text-hard">{error}</p>}

      <nav aria-label="Ad lists" className="mt-6 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((t) => {
          const on = tab === t.id;
          const count = counts[t.id];
          return (
            <Link
              key={t.id}
              href={`/admin/ads?tab=${t.id}`}
              aria-current={on ? 'page' : undefined}
              className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${on ? 'border-accent text-ink' : 'border-transparent text-muted hover:text-ink'}`}
            >
              {t.label}
              {count > 0 && <span className="rounded-full bg-hard px-2 py-0.5 text-[0.7rem] font-bold tabular-nums text-white">{count}</span>}
            </Link>
          );
        })}
      </nav>

      {ads.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-line bg-surface p-8 text-center text-sm text-muted">Nothing here yet.</p>
      ) : (
        <ul className="mt-6 space-y-6">
          {ads.map((ad) => {
            const [label, style] = statusLabel(ad, now);
            const isLive = ad.status === 'APPROVED' && ad.endsAt > now;
            return (
              <li key={ad.id} className="rounded-2xl border border-line bg-surface p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${style}`}>{label}</span>
                    <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">{AD_SLOTS[ad.slot].label}</span>
                    <span className="text-sm font-semibold tabular-nums">{usd(ad.amountCents)}</span>
                  </div>
                  <span className="text-xs text-muted">Created {dateTime(ad.createdAt)}</span>
                </div>

                <div className="mt-5 grid gap-6 lg:grid-cols-[2fr_3fr]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted">Banner</p>
                    <div className="mt-2"><AdCard ad={ad} /></div>
                    <p className="mt-2 break-all text-xs text-muted">Link: {ad.linkUrl}</p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted">Advertiser</p>
                      <dl className="mt-2 divide-y divide-line">
                        <Row label="Name">{ad.user.name}</Row>
                        <Row label="Account email">{ad.user.email}</Row>
                        <Row label="Contact email">{ad.contactEmail}</Row>
                        <Row label="Joined Buncho">{dateOnly(ad.user.createdAt)}</Row>
                        <Row label="Total bookings">{ad.user._count.adBookings}</Row>
                        <Row label="User ID">{ad.user.id}</Row>
                      </dl>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted">Payment (Dodo)</p>
                      <dl className="mt-2 divide-y divide-line">
                        <Row label="Amount">{usd(ad.amountCents)} {ad.currency}</Row>
                        <Row label="Paid at">{ad.paidAt ? dateTime(ad.paidAt) : null}</Row>
                        <Row label="Payment ID">{ad.dodoPaymentId}</Row>
                        <Row label="Method">{ad.paymentMethod}</Row>
                        <Row label="Payer email">{ad.payerEmail}</Row>
                        <Row label="Order ID">{ad.orderId}</Row>
                      </dl>
                    </div>
                  </div>
                </div>

                {(ad.startsAt || ad.adminNote) && (
                  <p className="mt-4 text-sm text-muted">
                    {ad.startsAt && ad.endsAt && <>Runs {dateOnly(ad.startsAt)} to {dateOnly(ad.endsAt)}. </>}
                    {ad.adminNote && <>Note: {ad.adminNote}</>}
                  </p>
                )}

                {ad.status === 'PAID' && (
                  <form className="mt-5 space-y-3 border-t border-line pt-5">
                    <input type="hidden" name="id" value={ad.id} />
                    <label className="block text-sm font-medium" htmlFor={`note-${ad.id}`}>Note <span className="font-normal text-muted">(optional, only you see it)</span></label>
                    <textarea id={`note-${ad.id}`} name="adminNote" maxLength={1000} className={`${input} min-h-16`} />
                    <div className="flex flex-wrap gap-3">
                      <PendingButton formAction={approveAd} pendingLabel="Approving…" className={primary}>Approve and go live</PendingButton>
                      <PendingButton formAction={rejectAd} pendingLabel="Rejecting…" className={danger}>Reject</PendingButton>
                    </div>
                    <p className="text-xs text-muted">If you reject, refund the payment in the Dodo dashboard. Approving starts a 1 month run today.</p>
                  </form>
                )}

                {isLive && (
                  <form className="mt-5 border-t border-line pt-5">
                    <input type="hidden" name="id" value={ad.id} />
                    <PendingButton formAction={endAd} pendingLabel="Ending…" className={neutral}>End now</PendingButton>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}