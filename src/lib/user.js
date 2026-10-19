import { cache } from 'react';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from './prisma';

/**
 * Returns the database user for the signed-in Clerk user, creating it on first visit.
 * Cached per request so several components can call it without extra queries.
 * Clerk's API is only called the first time a user is seen.
 */
export const getOrCreateUser = cache(async () => {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (existing) return existing;

  const cu = await currentUser();
  if (!cu) return null;

  const email = cu.primaryEmailAddress?.emailAddress ?? cu.emailAddresses?.[0]?.emailAddress ?? null;
  const name = [cu.firstName, cu.lastName].filter(Boolean).join(' ') || cu.username || null;

  return prisma.user.upsert({
    where: { clerkId: cu.id },
    update: {},
    create: { clerkId: cu.id, email, name, imageUrl: cu.imageUrl },
  });
});
