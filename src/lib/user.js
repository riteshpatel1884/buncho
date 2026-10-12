import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createHash, timingSafeEqual } from "node:crypto";
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
  // Admin doesn't have to register as a student or expert.
  if (!user.role) redirect((await isAdmin()) ? "/admin" : "/onboarding");
  if (user.role !== role) redirect("/dashboard");
  return user;
}

// Old way of naming admins (still works): Clerk user IDs in ADMIN_CLERK_IDS.
// New way: a person registers as admin with the secret code in ADMIN_REGISTRATION_CODE, which sets User.isAdmin.
const adminClerkIds = () =>
  (process.env.ADMIN_CLERK_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

// cache() makes this run once per request, even though many components call it.
export const isAdmin = cache(async () => {
  const { userId } = await auth();
  if (!userId) return false;
  if (adminClerkIds().includes(userId)) return true;
  const row = await prisma.user.findUnique({ where: { clerkUserId: userId }, select: { isAdmin: true } });
  return !!row?.isAdmin;
});

// True only when `entered` matches ADMIN_REGISTRATION_CODE. Constant-time, and never matches when the variable is unset.
export function adminCodeMatches(entered) {
  const secret = String(process.env.ADMIN_REGISTRATION_CODE || "").trim();
  const given = String(entered ?? "").trim();
  if (!secret || !given) return false;
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b);
}

// Database ids of the admin accounts (registered with the code, or listed in ADMIN_CLERK_IDS).
// Posts written by these users are "admin posts" in the feed.
export async function getAdminUserIds() {
  const ids = adminClerkIds();
  const rows = await prisma.user.findMany({
    where: { OR: [{ isAdmin: true }, ...(ids.length ? [{ clerkUserId: { in: ids } }] : [])] },
    select: { id: true },
  });
  return rows.map((r) => r.id);
}