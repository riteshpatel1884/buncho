import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

export async function getDbUser() {
  const { userId } = await auth();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { clerkUserId: userId } });
}

export async function getOrCreateUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await prisma.user.findUnique({ where: { clerkUserId: userId } });
  if (existing) return existing;

  const cu = await currentUser();
  const primary = cu?.primaryEmailAddress ?? cu?.emailAddresses?.[0];
  const email = primary?.emailAddress ?? `${userId}@no-email.local`;
  const verified = primary?.verification?.status === "verified";

  // Same email already in the DB under an older Clerk ID: re-link it.
  const byEmail = await prisma.user.findUnique({ where: { email } });
  if (byEmail) {
    if (!verified) throw new Error("Email is not verified, cannot link existing account.");
    return prisma.user.update({
      where: { id: byEmail.id },
      data: {
        clerkUserId: userId,
        name: byEmail.name ?? cu?.fullName ?? null,
        avatarUrl: cu?.imageUrl ?? byEmail.avatarUrl,
      },
    });
  }

  try {
    return await prisma.user.create({
      data: {
        clerkUserId: userId,
        email,
        name: cu?.fullName ?? null,
        avatarUrl: cu?.imageUrl ?? null,
      },
    });
  } catch (e) {
    // Two requests raced to create the same user: just read the winner.
    if (e?.code === "P2002") {
      const row = await prisma.user.findUnique({ where: { clerkUserId: userId } });
      if (row) return row;
    }
    throw e;
  }
}

// Pages call these instead of route-level path matching.
export async function requireUser(returnTo = "/dashboard") {
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent(returnTo)}`);
  return getOrCreateUser();
}

export async function requireRole(role, returnTo) {
  const user = await requireUser(returnTo);
  if (!user.role) redirect("/onboarding");
  if (user.role !== role) redirect("/dashboard");
  return user;
}

const adminClerkIds = () =>
  (process.env.ADMIN_CLERK_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export async function isAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  return adminClerkIds().includes(userId);
}

// Database ids of the admin accounts (the people listed in ADMIN_CLERK_IDS who have signed in at least once).
// Posts written by these users are "admin posts" in the feed.
export async function getAdminUserIds() {
  const ids = adminClerkIds();
  if (!ids.length) return [];
  const rows = await prisma.user.findMany({ where: { clerkUserId: { in: ids } }, select: { id: true } });
  return rows.map((r) => r.id);
}