import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { isAdmin } from '@/lib/admin';
import { PAGE_SIZE, PLAN_FILTERS, SORTS, buildWhere, loadUsers, parseUserParams, planOf } from '@/lib/admin-users';
import { formatMoney } from '@/lib/money';
import { ProBadge } from '@/components/ProBadge';

export const metadata = { title: 'Users' };
export const dynamic = 'force-dynamic';

const DAY = 86400000;
const dateFmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
const dateTimeFmt = (d) => d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

// What a user has paid in total, per currency, e.g. "₹99 + $2.99". Rupees and dollars are never added together.
const paidText = (u) =>
  [u.paidPaise > 0 && formatMoney(u.paidPaise, 'INR'), u.paidUsdCents > 0 && formatMoney(u.paidUsdCents, 'USD')]
    .filter(Boolean)
    .join(' + ');

function ago(d, now) {
  const days = Math.floor((now.getTime() - d.getTime()) / DAY);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} mo ago`;
  return `${Math.floor(days / 365)} yr ago`;
}

function hrefFor(base, params) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v && v !== 'all' && v !== 'new' && v !== 1) sp.set(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}

const input =
  'rounded-lg border border-line bg-surface-2/40 px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15';

export default async function AdminUsersPage({ searchParams }) {
  const me = await getOrCreateUser();
  if (!isAdmin(me)) notFound(); // don't reveal that the page exists

  const params = parseUserParams(await searchParams);
  const now = new Date();
  const where = buildWhere(params, now);

  const [total, activePro, expiredPro, new7, new30, matched] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { currentPeriodEnd: { gt: now } } }),
    prisma.subscription.count({ where: { currentPeriodEnd: { lte: now } } }),
    prisma.user.count({ where: { createdAt: { gte: new Date(now.getTime() - 7 * DAY) } } }),
    prisma.user.count({ where: { createdAt: { gte: new Date(now.getTime() - 30 * DAY) } } }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(matched / PAGE_SIZE));
  const page = Math.min(params.page, totalPages);
  const users = await loadUsers({ where, sort: params.sort, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE });

  const conversion = total ? ((activePro / total) * 100).toFixed(1).replace(/\.0$/, '') : '0';
  const filtered = Boolean(params.q || params.plan !== 'all');
  const base = { q: params.q, plan: params.plan, sort: params.sort };

  const stats = [
    ['Total users', total.toLocaleString('en-IN'), null],
    ['Active Pro', activePro.toLocaleString('en-IN'), `${conversion}% of users`],
    ['Expired Pro', expiredPro.toLocaleString('en-IN'), null],
    ['Joined, last 7 days', new7.toLocaleString('en-IN'), null],
    ['Joined, last 30 days', new30.toLocaleString('en-IN'), null],
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-muted">Everyone who has registered, with their plan and activity.</p>
        </div>
        <Link href="/admin/billing" className="text-sm font-semibold text-accent underline underline-offset-4">
          Pricing and offers
        </Link>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(([k, v, sub]) => (
          <div key={k} className="rounded-2xl border border-line bg-surface px-4 py-3">
            <dt className="text-xs text-muted">{k}</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums">{v}</dd>
            {sub && <p className="text-xs text-muted">{sub}</p>}
          </div>
        ))}
      </dl>

      {/* Search and filters (plain GET form: no client JavaScript) */}
      <form action="/admin/users" role="search" className="mt-8 flex flex-wrap items-end gap-3">
        <div className="min-w-[14rem] flex-1">
          <label htmlFor="q" className="text-xs font-medium text-muted">Search name or email</label>
          <input id="q" name="q" type="search" defaultValue={params.q} maxLength={80} placeholder="e.g. rahul or gmail.com" className={`${input} mt-1.5 w-full`} />
        </div>
        <div>
          <label htmlFor="plan" className="text-xs font-medium text-muted">Plan</label>
          <select id="plan" name="plan" defaultValue={params.plan} className={`${input} mt-1.5 block`}>
            {Object.entries(PLAN_FILTERS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="sort" className="text-xs font-medium text-muted">Sort</label>
          <select id="sort" name="sort" defaultValue={params.sort} className={`${input} mt-1.5 block`}>
            {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <button type="submit" className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink hover:opacity-90">Apply</button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-muted" role="status">
          {matched.toLocaleString('en-IN')} user{matched === 1 ? '' : 's'}
          {filtered && (
            <>
              {' '}match.{' '}
              <Link href="/admin/users" className="font-semibold text-accent underline underline-offset-4">Clear filters</Link>
            </>
          )}
        </p>
        {matched > 0 && (
          <a
            href={hrefFor('/admin/users/export', base)}
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold hover:bg-surface-2"
          >
            Download CSV
          </a>
        )}
      </div>

      {users.length ? (
        <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="border-b border-line bg-surface-2/50 text-xs text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-3 py-3 font-medium">Joined</th>
                <th className="px-3 py-3 font-medium">Plan</th>
                <th className="px-3 py-3 font-medium">Solved</th>
                <th className="px-3 py-3 font-medium">Last active</th>
                <th className="px-3 py-3 font-medium">Roles / mocks</th>
                <th className="px-4 py-3 text-right font-medium">Paid</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const plan = planOf(u.proUntil, now);
                return (
                  <tr key={u.id} className="border-t border-line align-middle">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {u.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={u.imageUrl} alt="" width={36} height={36} className="h-9 w-9 shrink-0 rounded-full object-cover" />
                        ) : (
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                            {(u.name ?? u.email ?? '?').charAt(0).toUpperCase()}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium">{u.name ?? 'No name'}</p>
                          <p className="truncate text-xs text-muted">{u.email ?? 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <p className="whitespace-nowrap">{dateFmt(u.joinedAt)}</p>
                      <p className="text-xs text-muted" title={dateTimeFmt(u.joinedAt)}>{ago(u.joinedAt, now)}</p>
                    </td>
                    <td className="px-3 py-3">
                      {plan === 'PRO' && (
                        <>
                          <ProBadge />
                          <p className="mt-1 whitespace-nowrap text-xs text-muted">until {dateFmt(u.proUntil)}</p>
                        </>
                      )}
                      {plan === 'EXPIRED' && (
                        <>
                          <span className="rounded-full bg-medium/15 px-2 py-0.5 text-xs font-semibold text-medium">Pro expired</span>
                          <p className="mt-1 whitespace-nowrap text-xs text-muted">on {dateFmt(u.proUntil)}</p>
                        </>
                      )}
                      {plan === 'FREE' && <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-semibold text-muted">Free</span>}
                    </td>
                    <td className="px-3 py-3 tabular-nums">
                      <span className="font-semibold">{u.solved}</span>
                      <span className="text-muted"> / {u.attempted} tried</span>
                    </td>
                    <td className="px-3 py-3">
                      {u.lastActive ? (
                        <>
                          <p className="whitespace-nowrap">{dateFmt(u.lastActive)}</p>
                          <p className="text-xs text-muted">{ago(u.lastActive, now)}</p>
                        </>
                      ) : (
                        <span className="text-xs text-muted">No activity</span>
                      )}
                    </td>
                    <td className="px-3 py-3 tabular-nums">
                      {u.roles} <span className="text-muted">/</span> {u.mocks}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {u.paidOrders ? (
                        <>
                          <p className="font-semibold">{paidText(u) || '—'}</p>
                          <p className="text-xs text-muted">{u.paidOrders} order{u.paidOrders === 1 ? '' : 's'}</p>
                        </>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-3 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">
          {filtered ? 'No users match those filters.' : 'No users yet.'}
        </p>
      )}

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-6 flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link rel="prev" href={hrefFor('/admin/users', { ...base, page: page - 1 })} className="rounded-md border border-line bg-surface px-4 py-2 font-medium hover:bg-surface-2">Previous</Link>
          ) : <span />}
          <span className="text-muted">Page {page} of {totalPages}</span>
          {page < totalPages ? (
            <Link rel="next" href={hrefFor('/admin/users', { ...base, page: page + 1 })} className="rounded-md border border-line bg-surface px-4 py-2 font-medium hover:bg-surface-2">Next</Link>
          ) : <span />}
        </nav>
      )}
    </div>
  );
}