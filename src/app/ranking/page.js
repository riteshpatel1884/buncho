import Link from "next/link";
import { SCORE_PARTS } from "@/lib/score";
import VerifiedBadge from "@/components/VerifiedBadge";

export const metadata = { title: "How ranking works | buncho" };

export default function RankingPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-3">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Money can buy verification. It cannot buy rank.</h1>
        <p className="text-lg text-muted">
          Buncho has two rules that never change: every builder gets a fair shot at exposure, and ranking comes from what real people do.
        </p>
      </div>

      <section className="card p-6 sm:p-8">
        <h2 className="font-display text-2xl font-bold">Daily Pick</h2>
        <p className="mt-2 text-muted">One product gets the main featured slot on the homepage for a full 24 hours, every day (India time).</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm">
          <li>Every approved product enters the rotation automatically. There is nothing to pay and nothing to bid on.</li>
          <li>Picks run in rounds. In each round every founder gets exactly one turn, in random order, then a new round starts.</li>
          <li>The turn belongs to the founder, not the product, so launching many products gives no extra chances.</li>
          <li>When your turn comes, we feature the product of yours that was picked least recently.</li>
          <li>Votes, score, followers, verification and payments play no part in who is picked.</li>
        </ul>
      </section>

      <section className="card p-6 sm:p-8">
        <h2 className="font-display text-2xl font-bold">The Buncho Score</h2>
        <p className="mt-2 text-muted">
          Every product gets a score from 0 to 100, based only on what people did in the last 30 days. Most parts are rates
          compared with visitors, so a product with a small audience that people love can outrank a big one that people ignore.
        </p>
        <ul className="mt-5 space-y-4">
          {SCORE_PARTS.map((p) => (
            <li key={p.key} className="flex gap-4">
              <span className="flex h-10 w-12 shrink-0 items-center justify-center rounded-xl bg-mint-soft text-sm font-bold text-mint">{p.max}</span>
              <div>
                <p className="font-semibold">{p.label}</p>
                <p className="text-sm text-muted">{p.hint}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-muted">
          You can see the exact breakdown for any product on its page, and for your own products on your dashboard.
        </p>
      </section>

      <section className="card p-6 sm:p-8">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold">
          Verification <VerifiedBadge className="h-6 w-6" />
        </h2>
        <p className="mt-2 text-muted">A one-time payment of ₹49 per product gets you:</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
          <li>A blue tick on your product</li>
          <li>A verified founder badge</li>
        </ul>
        <p className="mt-4 rounded-xl bg-surface-2 p-4 text-sm">
          It does not change your Buncho Score, your position in the list, or your chance of being the Daily Pick. Not by a single point.
        </p>
      </section>

      <section className="card p-6 sm:p-8">
        <h2 className="font-display text-2xl font-bold">Keeping it honest</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
          <li>Visits and clicks from bots, and from a product's own founder, are not counted.</li>
          <li>Repeat visits from the same person within 30 minutes count once.</li>
          <li>Founders can't upvote their own products, and their own comments don't count towards the score.</li>
          <li>Visitors are counted with an anonymous daily hash. We never store IP addresses.</li>
        </ul>
      </section>

      <div className="text-center">
        <Link href="/submit" className="btn-primary">Launch your product</Link>
      </div>
    </div>
  );
}