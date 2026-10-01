import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";
import { ensureFreshScores } from "@/lib/score";
import { istDayKey } from "@/lib/dailyPick";
import ProductLogo from "@/components/ProductLogo";
import CountUp from "@/components/CountUp";
import StatusBadge from "@/components/StatusBadge";
import VerifiedBadge from "@/components/VerifiedBadge";
import ScoreCard from "@/components/ScoreCard";
import SubmitButton from "@/components/SubmitButton";
import { startVerification } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard | buncho" };

export default async function Dashboard({ searchParams }) {
  const { submitted, verification } = await searchParams;
  const user = await getOrCreateUser();
  await ensureFreshScores();

  const products = await prisma.product.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { votes: true } } },
  });

  const [events, todaysPick, lastPick] = await Promise.all([
    prisma.productEvent.groupBy({
      by: ["productId", "type"],
      where: { productId: { in: products.map((p) => p.id) } },
      _count: { _all: true },
    }),
    prisma.dailyPick.findUnique({ where: { day: istDayKey() }, select: { productId: true } }),
    prisma.dailyPick.findFirst({ orderBy: { round: "desc" }, select: { round: true } }),
  ]);
  const hadTurn = lastPick
    ? !!(await prisma.dailyPick.findFirst({ where: { round: lastPick.round, userId: user.id }, select: { id: true } }))
    : false;

  // rank = position among approved products by Buncho Score
  const ranks = new Map();
  for (const p of products.filter((x) => x.status === "APPROVED")) {
    ranks.set(p.id, (await prisma.product.count({ where: { status: "APPROVED", score: { gt: p.score } } })) + 1);
  }

  const stat = (id, type) => events.find((e) => e.productId === id && e.type === type)?._count._all ?? 0;
  const totals = products.reduce(
    (t, p) => ({
      views: t.views + stat(p.id, "VIEW"),
      clicks: t.clicks + stat(p.id, "CLICK"),
      votes: t.votes + p._count.votes,
    }),
    { views: 0, clicks: 0, votes: 0 }
  );
  const cards = [
    ["Products", products.length],
    ["Views", totals.views],
    ["Clicks to your site", totals.clicks],
    ["Upvotes", totals.votes],
  ];
  const rate = (v, c) => (v ? `${Math.round((c / v) * 100)}%` : "0%");
  const approved = products.some((p) => p.status === "APPROVED");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Your dashboard</h1>
          <p className="mt-1 text-muted">See how your launches are doing.</p>
        </div>
        <Link href="/submit" className="btn-primary">Launch another product</Link>
      </div>

      {submitted && (
        <p role="status" className="rounded-xl bg-mint-soft p-4 text-sm font-medium text-mint">
          Submitted. Your product is in review and will appear publicly once approved.
        </p>
      )}
      {verification === "processing" && (
        <p role="status" className="rounded-xl bg-mint-soft p-4 text-sm font-medium text-mint">
          Thanks. Your tick appears as soon as the payment is confirmed, usually within a minute. Refresh this page to check.
        </p>
      )}
      {verification === "error" && (
        <p role="alert" className="rounded-xl bg-red-500/10 p-4 text-sm text-red-300">
          We couldn't start the payment. Nothing was charged. Please try again in a moment.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map(([label, value], i) => (
          <div key={label} className="card rise p-4 sm:p-5" style={{ "--i": i }}>
            <p className="font-display text-2xl font-bold sm:text-3xl"><CountUp value={value} /></p>
            <p className="mt-1 text-sm text-muted">{label}</p>
          </div>
        ))}
      </div>

      {approved && (
        <div className="card p-5 text-sm">
          <p className="font-semibold">Your Daily Pick turn</p>
          <p className="mt-1 text-muted">
            {hadTurn
              ? "You have already had your turn in this round. You'll be in the next round, in a random position."
              : "Your turn is still to come in this round. The order is random, and every founder gets exactly one turn."}{" "}
            <Link href="/ranking" className="font-medium text-brand hover:underline">How it works</Link>
          </p>
        </div>
      )}

      {products.length === 0 ? (
        <div className="card border-dashed p-8 text-center sm:p-10">
          <p className="font-display text-lg font-semibold">You haven't launched anything yet</p>
          <p className="mt-1 text-sm text-muted">Your first product takes about five minutes to submit.</p>
          <Link href="/submit" className="btn-primary mt-5">Launch a product</Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {products.map((p) => {
            const v = stat(p.id, "VIEW");
            const c = stat(p.id, "CLICK");
            const live = p.status === "APPROVED";
            return (
              <li key={p.id} className="card p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <ProductLogo product={p} size={44} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {live ? (
                        <Link href={`/products/${p.slug}`} className="truncate font-display text-lg font-semibold hover:underline">{p.name}</Link>
                      ) : (
                        <span className="truncate font-display text-lg font-semibold">{p.name}</span>
                      )}
                      {p.verified && <VerifiedBadge />}
                    </div>
                    {todaysPick?.productId === p.id && (
                      <span className="mt-1 inline-block rounded-full bg-brand px-2.5 py-0.5 text-xs font-bold text-on-brand">Today's Daily Pick</span>
                    )}
                  </div>
                  <StatusBadge status={p.status} />
                </div>

                <dl className="mt-5 grid grid-cols-3 gap-3 text-center sm:grid-cols-6">
                  {[
                    ["Views", v],
                    ["Clicks", c],
                    ["Click rate", rate(v, c)],
                    ["Votes", p._count.votes],
                    ["Score", live ? p.score.toFixed(1) : "-"],
                    ["Rank", live ? `#${ranks.get(p.id)}` : "-"],
                  ].map(([k, val]) => (
                    <div key={k} className="rounded-xl bg-surface-2 p-3">
                      <dd className="font-display text-lg font-bold">{val}</dd>
                      <dt className="text-xs text-muted">{k}</dt>
                    </div>
                  ))}
                </dl>

                {live && (
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                    {p.verified ? (
                      <p className="flex items-center gap-2 text-sm text-muted">
                        <VerifiedBadge /> Verified founder and product
                      </p>
                    ) : (
                      <form action={startVerification} className="flex flex-wrap items-center gap-3">
                        <input type="hidden" name="productId" value={p.id} />
                        <SubmitButton className="btn-outline" pendingText="Opening checkout">
                          <VerifiedBadge /> Get verified for ₹49
                        </SubmitButton>
                        <span className="text-xs text-muted">Blue tick only. It never changes your ranking.</span>
                      </form>
                    )}
                  </div>
                )}

                {live && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-brand">See the score breakdown</summary>
                    <ScoreCard score={p.score} data={p.scoreData} rank={ranks.get(p.id)} className="mt-4 rounded-2xl bg-surface-2 p-5" />
                  </details>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}