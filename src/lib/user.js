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

export async function isAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  return (process.env.ADMIN_CLERK_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .includes(userId);
}
