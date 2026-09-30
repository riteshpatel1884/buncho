import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

// Returns the DB user for the signed-in Clerk user, or null. Does not create.
export async function getDbUser() {
  const { userId } = await auth();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { clerkUserId: userId } });
}

// Returns the DB user, creating the row on first use (submit / vote / comment).
export async function getOrCreateUser() {
  const { userId } = await auth();
  if (!userId) return null;
  const existing = await prisma.user.findUnique({ where: { clerkUserId: userId } });
  if (existing) return existing;

  const cu = await currentUser();
  return prisma.user.upsert({
    where: { clerkUserId: userId },
    update: {},
    create: {
      clerkUserId: userId,
      email: cu?.emailAddresses?.[0]?.emailAddress ?? `${userId}@no-email.local`,
      name: cu?.fullName ?? null,
      avatarUrl: cu?.imageUrl ?? null,
    },
  });
}

export async function isAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  return (process.env.ADMIN_CLERK_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .includes(userId);
}
