import Link from "next/link";
import { SCORE_PARTS } from "@/lib/score";

// Shows a product's Buncho Score and exactly where each point came from.
export default function ScoreCard({ score, data, rank, className = "card p-5" }) {
  const parts = data?.parts ?? {};
  const i = data?.inputs;
  return (
    <div className={className}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-display text-4xl font-bold leading-none">
            {score.toFixed(1)}<span className="ml-1 text-base font-medium text-muted">/ 100</span>
          </p>
          <p className="mt-1 text-sm text-muted">Buncho Score</p>
        </div>
        {rank && <span className="rounded-full bg-mint-soft px-3 py-1 text-sm font-semibold text-mint">Rank #{rank}</span>}
      </div>

      <ul className="mt-5 space-y-4">
        {SCORE_PARTS.map((p) => {
          const pts = parts[p.key] ?? 0;
          return (
            <li key={p.key}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium">{p.label}</span>
                <span className="tabular-nums text-muted">{pts.toFixed(1)} / {p.max}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div className="bar-grow h-full rounded-full bg-brand" style={{ width: `${(pts / p.max) * 100}%` }} />
              </div>
              <p className="mt-1 text-xs text-muted">{p.hint}</p>
            </li>
          );
        })}
      </ul>

      {i && (
        <p className="mt-5 text-xs text-muted">
          Last 30 days: {i.visitors} visitors, {i.clicks} website clicks, {i.voters} upvoters, {i.commenters} commenters.
        </p>
      )}
      <p className="mt-2 text-xs text-muted">
        Verification and payments never change this score.{" "}
        <Link href="/ranking" className="font-medium text-brand hover:underline">How it works</Link>
      </p>
    </div>
  );
}