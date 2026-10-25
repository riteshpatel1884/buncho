import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { isAdmin } from '@/lib/admin';
import { OFFER_TYPES, describeDeal, getBillingSettings } from '@/lib/pricing';
import PendingButton from '@/components/PendingButton';
import { createCode, deleteCode, saveSettings, toggleCode } from './actions';

export const metadata = { title: 'Pricing and offers' };
export const dynamic = 'force-dynamic';

const toInput = (d) =>
  d
    ? new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      })
        .format(d)
        .replace(' ', 'T')
    : '';

const fmt = (d) => (d ? d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) : '—');
const rupees = (paise) => `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const input =
  'w-full rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15';
const label = 'text-xs font-medium text-muted';
const primary = 'rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink hover:opacity-90';
const neutral = 'rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold hover:bg-surface-2';

function Card({ title, hint, children }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function TypeSelect({ name, defaultValue }) {
  return (
    <select name={name} defaultValue={defaultValue} className={input}>
      {Object.entries(OFFER_TYPES).map(([k, v]) => (
        <option key={k} value={k}>{v}</option>
      ))}
    </select>
  );
}

export default async function AdminBillingPage({ searchParams }) {
  const user = await getOrCreateUser();
  if (!isAdmin(user)) notFound(); // don't reveal that the page exists

  const sp = await searchParams;
  const saved = typeof sp.saved === 'string' ? sp.saved : null;
  const error = typeof sp.error === 'string' ? sp.error : null;

  const [settings, codes, payments, paidCount, revenue, activePro] = await Promise.all([
    getBillingSettings(),
    prisma.discountCode.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 15,
      include: { user: { select: { email: true, name: true } } },
    }),
    prisma.payment.count({ where: { status: 'PAID' } }),
    prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amountPaise: true } }),
    prisma.subscription.count({ where: { currentPeriodEnd: { gt: new Date() } } }),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pricing and offers</h1>
          <p className="mt-1 text-sm text-muted">Change the Pro price, run offers and create promo codes. Changes go live on /pricing straight away.</p>
        </div>
        <Link href="/pricing" className="text-sm font-semibold text-accent underline underline-offset-4">View pricing page</Link>
      </div>

      {saved && <p role="status" className="mt-5 rounded-xl border border-accent/40 bg-accent-soft px-4 py-3 text-sm font-medium text-accent">{saved}</p>}
      {error && <p role="alert" className="mt-5 rounded-xl border border-hard/40 bg-hard/10 px-4 py-3 text-sm font-medium text-hard">{error}</p>}

      <dl className="mt-6 grid grid-cols-3 gap-3">
        {[
          ['Active Pro users', activePro],
          ['Paid orders', paidCount],
          ['Revenue', rupees(revenue._sum.amountPaise ?? 0)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-line bg-surface px-4 py-3">
            <dt className="text-xs text-muted">{k}</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 space-y-8">
        {/* Price and site-wide offer */}
        <Card title="Pro price and site-wide offer" hint="The offer applies to everyone automatically. A promo code replaces it (they do not stack). The lowest price is ₹1.">
          <form action={saveSettings} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <label htmlFor="proName" className={label}>Plan name</label>
                <input id="proName" name="proName" defaultValue={settings.proName} maxLength={40} required className={`${input} mt-1.5`} />
              </div>
              <div>
                <label htmlFor="priceInr" className={label}>Price (₹)</label>
                <input id="priceInr" name="priceInr" type="number" min={1} max={100000} defaultValue={settings.priceInr} required className={`${input} mt-1.5`} />
              </div>
              <div>
                <label htmlFor="periodMonths" className={label}>Length (months)</label>
                <input id="periodMonths" name="periodMonths" type="number" min={1} max={24} defaultValue={settings.periodMonths} required className={`${input} mt-1.5`} />
              </div>
            </div>

            <label className="flex items-center gap-2.5 text-sm font-medium">
              <input type="checkbox" name="checkoutOpen" defaultChecked={settings.checkoutOpen} className="h-4 w-4 accent-accent" />
              Upgrades open (untick to pause all new payments)
            </label>

            <div className="rounded-xl border border-line p-4">
              <label className="flex items-center gap-2.5 text-sm font-semibold">
                <input type="checkbox" name="offerOn" defaultChecked={settings.offerOn} className="h-4 w-4 accent-accent" />
                Site-wide offer is on
              </label>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="lg:col-span-2">
                  <label htmlFor="offerLabel" className={label}>Badge text on the pricing page (optional)</label>
                  <input id="offerLabel" name="offerLabel" defaultValue={settings.offerLabel} maxLength={60} placeholder="Diwali offer: 30% off" className={`${input} mt-1.5`} />
                </div>
                <div>
                  <label htmlFor="offerType" className={label}>Offer type</label>
                  <div className="mt-1.5"><TypeSelect name="offerType" defaultValue={settings.offerType} /></div>
                </div>
                <div>
                  <label htmlFor="offerValue" className={label}>Value</label>
                  <input id="offerValue" name="offerValue" type="number" min={0} defaultValue={settings.offerValue || ''} className={`${input} mt-1.5`} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="offerEndsAt" className={label}>Ends (India time, empty = no end)</label>
                  <input id="offerEndsAt" name="offerEndsAt" type="datetime-local" defaultValue={toInput(settings.offerEndsAt)} className={`${input} mt-1.5`} />
                </div>
              </div>
              <p className="mt-3 text-xs text-muted">Value means: percent for “Percent off” (1 to 99), rupees for “Flat ₹ off”, days for “Bonus days free”.</p>
            </div>

            <PendingButton className={primary} pendingLabel="Saving…">Save settings</PendingButton>
          </form>
        </Card>

        {/* Promo codes */}
        <Card title="Promo codes" hint="Buyers type these on the pricing page. The discount is applied before payment.">
          <form action={createCode} className="grid gap-4 rounded-xl border border-line p-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="code" className={label}>Code</label>
              <input id="code" name="code" required minLength={3} maxLength={24} placeholder="WELCOME20" className={`${input} mt-1.5 uppercase`} />
            </div>
            <div>
              <label htmlFor="type" className={label}>Type</label>
              <div className="mt-1.5"><TypeSelect name="type" defaultValue="PERCENT_OFF" /></div>
            </div>
            <div>
              <label htmlFor="value" className={label}>Value</label>
              <input id="value" name="value" type="number" min={1} required className={`${input} mt-1.5`} />
            </div>
            <div>
              <label htmlFor="perUserLimit" className={label}>Uses per person</label>
              <input id="perUserLimit" name="perUserLimit" type="number" min={1} max={100} defaultValue={1} className={`${input} mt-1.5`} />
            </div>
            <div>
              <label htmlFor="maxRedemptions" className={label}>Max total uses (empty = unlimited)</label>
              <input id="maxRedemptions" name="maxRedemptions" type="number" min={1} className={`${input} mt-1.5`} />
            </div>
            <div>
              <label htmlFor="startsAt" className={label}>Starts (India time)</label>
              <input id="startsAt" name="startsAt" type="datetime-local" className={`${input} mt-1.5`} />
            </div>
            <div>
              <label htmlFor="expiresAt" className={label}>Expires (India time)</label>
              <input id="expiresAt" name="expiresAt" type="datetime-local" className={`${input} mt-1.5`} />
            </div>
            <div>
              <label htmlFor="note" className={label}>Note for you (optional)</label>
              <input id="note" name="note" maxLength={120} className={`${input} mt-1.5`} />
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <PendingButton className={primary} pendingLabel="Creating…">Create code</PendingButton>
            </div>
          </form>

          {codes.length ? (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead className="text-xs text-muted">
                  <tr>
                    <th className="py-2 pr-3 font-medium">Code</th>
                    <th className="py-2 pr-3 font-medium">Deal</th>
                    <th className="py-2 pr-3 font-medium">Used</th>
                    <th className="py-2 pr-3 font-medium">Valid</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                    <th className="py-2 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {codes.map((c) => (
                    <tr key={c.id} className="border-t border-line align-top">
                      <td className="py-3 pr-3">
                        <p className="font-semibold tracking-wide">{c.code}</p>
                        {c.note && <p className="text-xs text-muted">{c.note}</p>}
                      </td>
                      <td className="py-3 pr-3">{describeDeal(c.type, c.value)}</td>
                      <td className="py-3 pr-3 tabular-nums">
                        {c.redeemedCount}{c.maxRedemptions != null ? ` / ${c.maxRedemptions}` : ''}
                        <p className="text-xs text-muted">{c.perUserLimit} per person</p>
                      </td>
                      <td className="py-3 pr-3 text-xs text-muted">
                        {c.startsAt ? `From ${fmt(c.startsAt)}` : 'From now'}
                        <br />
                        {c.expiresAt ? `Until ${fmt(c.expiresAt)}` : 'No end date'}
                      </td>
                      <td className="py-3 pr-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.active ? 'bg-accent-soft text-accent' : 'bg-surface-2 text-muted'}`}>
                          {c.active ? 'On' : 'Off'}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end gap-2">
                          <form action={toggleCode}>
                            <input type="hidden" name="id" value={c.id} />
                            <PendingButton className={neutral}>{c.active ? 'Turn off' : 'Turn on'}</PendingButton>
                          </form>
                          <form action={deleteCode}>
                            <input type="hidden" name="id" value={c.id} />
                            <PendingButton className={`${neutral} text-hard`}>Delete</PendingButton>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-5 rounded-lg bg-surface-2/60 px-4 py-5 text-sm text-muted">No promo codes yet.</p>
          )}
        </Card>

        {/* Recent payments */}
        <Card title="Recent payments" hint="The last 15 orders, newest first.">
          {payments.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead className="text-xs text-muted">
                  <tr>
                    <th className="py-2 pr-3 font-medium">When</th>
                    <th className="py-2 pr-3 font-medium">User</th>
                    <th className="py-2 pr-3 font-medium">Paid</th>
                    <th className="py-2 pr-3 font-medium">Code</th>
                    <th className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-t border-line">
                      <td className="py-2.5 pr-3 text-xs text-muted">{fmt(p.createdAt)}</td>
                      <td className="py-2.5 pr-3">{p.user.name ?? p.user.email ?? 'unknown'}</td>
                      <td className="py-2.5 pr-3 tabular-nums">{rupees(p.amountPaise)}</td>
                      <td className="py-2.5 pr-3 text-xs">{p.discountCode ?? '—'}</td>
                      <td className="py-2.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            p.status === 'PAID' ? 'bg-accent-soft text-accent' : p.status === 'FAILED' ? 'bg-hard/10 text-hard' : 'bg-surface-2 text-muted'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="rounded-lg bg-surface-2/60 px-4 py-5 text-sm text-muted">No payments yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}