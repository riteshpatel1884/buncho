import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

function makeUsername(cu) {
  const raw = cu.username || cu.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "user";
  return raw.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20) || "user";
}

// Returns the DB user for the signed-in Clerk user, creating it on first use.
export async function getDbUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (existing) return existing;

  const cu = await currentUser();
  if (!cu) return null;
  const base = makeUsername(cu);
  const name = [cu.firstName, cu.lastName].filter(Boolean).join(" ") || base;

  for (let i = 0; i < 5; i++) {
    const username = i === 0 ? base : `${base}${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      return await prisma.user.create({
        data: { clerkId: userId, username, name, imageUrl: cu.imageUrl },
      });
    } catch (e) {
      if (e?.code !== "P2002") throw e;
      // Either a concurrent request created this user, or the username is taken.
      const again = await prisma.user.findUnique({ where: { clerkId: userId } });
      if (again) return again;
    }
  }
  throw new Error("Could not create user");
}
