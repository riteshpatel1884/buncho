import { prisma } from './prisma';

export const PAGE_SIZE = 25;
export const PLAN_FILTERS = { all: 'All users', pro: 'Pro (active)', free: 'Free (never paid)', expired: 'Pro expired' };
export const SORTS = { new: 'Newest first', old: 'Oldest first' };

/** Turns untrusted search params into a safe filter object. */
export function parseUserParams(sp = {}) {
  const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  return {
    q: str(sp.q, 80),
    plan: typeof sp.plan === 'string' && Object.hasOwn(PLAN_FILTERS, sp.plan) ? sp.plan : 'all',
    sort: typeof sp.sort === 'string' && Object.hasOwn(SORTS, sp.sort) ? sp.sort : 'new',
    page: Math.max(1, parseInt(sp.page, 10) || 1),
  };
}

export function buildWhere({ q, plan }, now = new Date()) {
  const where = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (plan === 'pro') where.subscription = { is: { currentPeriodEnd: { gt: now } } };
  if (plan === 'expired') where.subscription = { is: { currentPeriodEnd: { lte: now } } };
  if (plan === 'free') where.subscription = { is: null };
  return where;
}

/** 'PRO' while the period is in the future, 'EXPIRED' if they paid before, otherwise 'FREE'. */
export function planOf(proUntil, now = new Date()) {
  if (!proUntil) return 'FREE';
  return proUntil > now ? 'PRO' : 'EXPIRED';
}

/** One page of users with their plan, activity and payment totals. */
export async function loadUsers({ where, sort = 'new', skip = 0, take = PAGE_SIZE }) {
  const dir = sort === 'old' ? 'asc' : 'desc';
  const users = await prisma.user.findMany({
    where,
    orderBy: [{ createdAt: dir }, { id: 'asc' }],
    skip,
    take,
    select: {
      id: true,
      name: true,
      email: true,
      imageUrl: true,
      createdAt: true,
      mockAttemptsUsed: true,
      subscription: { select: { currentPeriodEnd: true } },
      _count: { select: { jobTargets: true } },
    },
  });
  if (!users.length) return [];

  const ids = users.map((u) => u.id);
  const [solved, activity, paid] = await Promise.all([
    prisma.problemProgress.groupBy({
      by: ['userId'],
      where: { userId: { in: ids }, status: 'COMPLETED' },
      _count: { _all: true },
    }),
    prisma.problemProgress.groupBy({
      by: ['userId'],
      where: { userId: { in: ids } },
      _count: { _all: true },
      _max: { lastActivityAt: true },
    }),
    // Grouped by currency as well, so rupees and dollars are never added together
    prisma.payment.groupBy({
      by: ['userId', 'currency'],
      where: { userId: { in: ids }, status: 'PAID' },
      _count: { _all: true },
      _sum: { amountPaise: true },
    }),
  ]);

  const solvedBy = new Map(solved.map((r) => [r.userId, r._count._all]));
  const activityBy = new Map(activity.map((r) => [r.userId, r]));
  const paidBy = new Map();
  paid.forEach((r) => {
    const row = paidBy.get(r.userId) ?? { orders: 0, inrPaise: 0, usdCents: 0 };
    row.orders += r._count._all;
    if (r.currency === 'INR') row.inrPaise += r._sum.amountPaise ?? 0;
    if (r.currency === 'USD') row.usdCents += r._sum.amountPaise ?? 0;
    paidBy.set(r.userId, row);
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    imageUrl: u.imageUrl,
    joinedAt: u.createdAt,
    proUntil: u.subscription?.currentPeriodEnd ?? null,
    solved: solvedBy.get(u.id) ?? 0,
    attempted: activityBy.get(u.id)?._count._all ?? 0,
    lastActive: activityBy.get(u.id)?._max.lastActivityAt ?? null,
    paidOrders: paidBy.get(u.id)?.orders ?? 0, // all currencies
    paidPaise: paidBy.get(u.id)?.inrPaise ?? 0, // INR only
    paidUsdCents: paidBy.get(u.id)?.usdCents ?? 0, // USD only
    roles: u._count.jobTargets,
    mocks: u.mockAttemptsUsed,
  }));
}