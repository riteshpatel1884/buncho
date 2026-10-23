import { cache } from 'react';
import { prisma } from './prisma';
import { FREE_MOCK_LIMIT, FREE_ROLE_LIMIT } from './constants';

/** Pro is active while the subscription period has not ended. No status flag, no cron job. */
export const getSubscription = cache(async (userId) => {
  if (!userId) return null;
  return prisma.subscription.findUnique({ where: { userId } });
});

export const getIsPro = cache(async (userId) => {
  const sub = await getSubscription(userId);
  return Boolean(sub && sub.currentPeriodEnd > new Date());
});

/** Everything the UI and server actions need to decide what a user may do. Limits are null for Pro (unlimited). */
export const getEntitlements = cache(async (userId) => {
  if (!userId) {
    return { isPro: false, periodEnd: null, roles: { used: 0, limit: FREE_ROLE_LIMIT, canAdd: false }, mocks: { used: 0, limit: FREE_MOCK_LIMIT, canStart: false } };
  }
  const [sub, roleCount, row] = await Promise.all([
    getSubscription(userId),
    prisma.jobTarget.count({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { mockAttemptsUsed: true } }),
  ]);
  const isPro = Boolean(sub && sub.currentPeriodEnd > new Date());
  const mocksUsed = row?.mockAttemptsUsed ?? 0;
  return {
    isPro,
    periodEnd: isPro ? sub.currentPeriodEnd : null,
    roles: { used: roleCount, limit: isPro ? null : FREE_ROLE_LIMIT, canAdd: isPro || roleCount < FREE_ROLE_LIMIT },
    mocks: { used: mocksUsed, limit: isPro ? null : FREE_MOCK_LIMIT, canStart: isPro || mocksUsed < FREE_MOCK_LIMIT },
  };
});

/** Prisma `select` fragment for the Pro-only columns. Empty for free users, so the values never leave the database. */
export const insightSelect = (isPro) => (isPro ? { askedFrequency: true, askedByCompanies: true } : {});

/** Adds askedFrequency / askedByCompanies to items that have a `slug`. A no-op for free users. */
export async function attachInsights(items, isPro) {
  if (!isPro || !items.length) return items;
  const rows = await prisma.problem.findMany({
    where: { slug: { in: [...new Set(items.map((i) => i.slug))] } },
    select: { slug: true, askedFrequency: true, askedByCompanies: true },
  });
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  return items.map((i) => ({
    ...i,
    askedFrequency: bySlug.get(i.slug)?.askedFrequency ?? null,
    askedByCompanies: bySlug.get(i.slug)?.askedByCompanies ?? [],
  }));
}