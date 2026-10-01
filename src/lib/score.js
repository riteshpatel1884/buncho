import { prisma } from "./prisma";

const DAY = 24 * 60 * 60 * 1000;
const clamp01 = (n) => Math.max(0, Math.min(1, n));
const round1 = (n) => Math.round(n * 10) / 10;

// The five parts of the Buncho Score. Verification and payments are NOT part of it.
export const SCORE_PARTS = [
  { key: "engagement", label: "Engagement", max: 25, hint: "People who upvoted or commented, compared with how many visited." },
  { key: "upvoteRate", label: "Upvote rate", max: 20, hint: "Share of visitors who upvote." },
  { key: "ctr", label: "Website CTR", max: 20, hint: "Share of visitors who click through to the product's website." },
  { key: "growth", label: "Recent growth", max: 20, hint: "Visitors this week compared with the week before." },
  { key: "activity", label: "Visitor activity", max: 15, hint: "Unique visitors on a log scale, so a big existing audience cannot dominate." },
];

// Pure function: signals in, score out.
export function scoreFrom({ visitors, visitors7, visitorsPrev, clicks, voters, commenters }) {
  const engagement = clamp01((voters + 2 * commenters) / (visitors + 20) / 0.15);
  const upvoteRate = clamp01(voters / (visitors + 20) / 0.1);
  const ctr = clamp01(clicks / (visitors + 10) / 0.35);
  const g = Math.max(-2, Math.min(2, Math.log2((visitors7 + 5) / (visitorsPrev + 5))));
  const growth = visitors7 === 0 ? 0 : clamp01((g + 2) / 4);
  const activity = clamp01(Math.log10(1 + visitors) / 3);

  const parts = {
    engagement: round1(engagement * 25),
    upvoteRate: round1(upvoteRate * 20),
    ctr: round1(ctr * 20),
    growth: round1(growth * 20),
    activity: round1(activity * 15),
  };
  const total = round1(Object.values(parts).reduce((a, b) => a + b, 0));
  return { total, parts, inputs: { visitors, visitors7, visitorsPrev, clicks, voters, commenters } };
}

// Reads the last 30 days of behaviour for every approved product and stores the scores.
export async function recomputeScores() {
  const products = await prisma.product.findMany({ where: { status: "APPROVED" }, select: { id: true } });
  if (products.length === 0) return;

  const now = Date.now();
  const d30 = new Date(now - 30 * DAY);
  const d7 = new Date(now - 7 * DAY);
  const d14 = new Date(now - 14 * DAY);

  const [events, votes, comments] = await Promise.all([
    prisma.$queryRaw`
      SELECT "productId",
        COUNT(DISTINCT "visitorHash") FILTER (WHERE "type" = 'VIEW') AS visitors,
        COUNT(DISTINCT "visitorHash") FILTER (WHERE "type" = 'VIEW' AND "createdAt" >= ${d7}) AS visitors7,
        COUNT(DISTINCT "visitorHash") FILTER (WHERE "type" = 'VIEW' AND "createdAt" >= ${d14} AND "createdAt" < ${d7}) AS "visitorsPrev",
        COUNT(DISTINCT "visitorHash") FILTER (WHERE "type" = 'CLICK') AS clicks
      FROM "ProductEvent"
      WHERE "createdAt" >= ${d30}
      GROUP BY "productId"`,
    prisma.$queryRaw`
      SELECT v."productId", COUNT(DISTINCT v."userId") AS voters
      FROM "Vote" v JOIN "Product" p ON p."id" = v."productId"
      WHERE v."userId" <> p."userId" AND v."createdAt" >= ${d30}
      GROUP BY v."productId"`,
    prisma.$queryRaw`
      SELECT c."productId", COUNT(DISTINCT c."userId") AS commenters
      FROM "Comment" c JOIN "Product" p ON p."id" = c."productId"
      WHERE c."userId" <> p."userId" AND c."createdAt" >= ${d30}
      GROUP BY c."productId"`,
  ]);

  const byId = (rows, key) => new Map(rows.map((r) => [r.productId, Number(r[key])]));
  const E = new Map(events.map((r) => [r.productId, r]));
  const V = byId(votes, "voters");
  const C = byId(comments, "commenters");
  const stamp = new Date();

  await prisma.$transaction(
    products.map((p) => {
      const e = E.get(p.id);
      const result = scoreFrom({
        visitors: Number(e?.visitors ?? 0),
        visitors7: Number(e?.visitors7 ?? 0),
        visitorsPrev: Number(e?.visitorsPrev ?? 0),
        clicks: Number(e?.clicks ?? 0),
        voters: V.get(p.id) ?? 0,
        commenters: C.get(p.id) ?? 0,
      });
      return prisma.product.update({
        where: { id: p.id },
        data: { score: result.total, scoreData: { parts: result.parts, inputs: result.inputs }, scoreUpdatedAt: stamp },
      });
    })
  );
}

// Refreshes scores when any approved product's score is older than 10 minutes.
export async function ensureFreshScores(maxAgeMs = 10 * 60 * 1000) {
  const stale = await prisma.product.count({
    where: {
      status: "APPROVED",
      OR: [{ scoreUpdatedAt: null }, { scoreUpdatedAt: { lt: new Date(Date.now() - maxAgeMs) } }],
    },
  });
  if (stale > 0) await recomputeScores();
}