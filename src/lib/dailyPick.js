import { randomInt } from "node:crypto";
import { prisma } from "./prisma";

const TZ = "Asia/Kolkata";

// "2026-10-01" in India time
export function istDayKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

function istDayBounds(key) {
  const startsAt = new Date(`${key}T00:00:00+05:30`);
  return { startsAt, endsAt: new Date(startsAt.getTime() + 24 * 60 * 60 * 1000) };
}

const include = {
  product: {
    include: {
      category: true,
      user: { select: { name: true, username: true } },
      _count: { select: { votes: true, comments: true } },
    },
  },
};

// Today's pick (India time). Created on first request of the day.
//
// Fairness rules:
//  - Picks are grouped into rounds. In each round every founder gets exactly one turn, in random order.
//  - The turn belongs to the founder, not the product, so owning many products gives no extra chances.
//  - When a founder's turn comes, their product that was picked longest ago (or never) is chosen.
//  - Payment, verification, votes and score play no part.
export async function getTodaysPick() {
  const day = istDayKey();

  const existing = await prisma.dailyPick.findUnique({ where: { day }, include });
  if (existing) return existing.product.status === "APPROVED" ? existing : null;

  const products = await prisma.product.findMany({
    where: { status: "APPROVED" },
    select: { id: true, userId: true, lastPickedAt: true },
  });
  if (products.length === 0) return null;

  const byFounder = new Map();
  for (const p of products) {
    if (!byFounder.has(p.userId)) byFounder.set(p.userId, []);
    byFounder.get(p.userId).push(p);
  }

  const last = await prisma.dailyPick.findFirst({ orderBy: { round: "desc" }, select: { round: true } });
  let round = last?.round ?? 1;
  const taken = new Set((await prisma.dailyPick.findMany({ where: { round }, select: { userId: true } })).map((r) => r.userId));

  let eligible = [...byFounder.keys()].filter((id) => !taken.has(id));
  if (eligible.length === 0) {
    round += 1; // everyone has had a turn, start a new round
    eligible = [...byFounder.keys()];
  }

  const founderId = eligible[randomInt(eligible.length)];
  const chosen = byFounder
    .get(founderId)
    .sort((a, b) => (a.lastPickedAt?.getTime() ?? 0) - (b.lastPickedAt?.getTime() ?? 0))[0];

  const { startsAt, endsAt } = istDayBounds(day);
  try {
    await prisma.$transaction([
      prisma.dailyPick.create({ data: { day, round, startsAt, endsAt, productId: chosen.id, userId: founderId } }),
      prisma.product.update({ where: { id: chosen.id }, data: { lastPickedAt: new Date() } }),
    ]);
  } catch {
    // Another request created today's pick first. The unique "day" column keeps it to one.
  }
  return prisma.dailyPick.findUnique({ where: { day }, include });
}