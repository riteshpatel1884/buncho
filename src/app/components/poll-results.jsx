import { CheckCircle2 } from "lucide-react";

export default function PollResults({ options, total, myOptionId, winningOptionId }) {
  return (
    <ul className="space-y-3">
      {options.map((o) => {
        const pct = total ? Math.round((o.votes / total) * 100) : 0;
        const isWinner = o.id === winningOptionId;
        return (
          <li key={o.id} className="relative overflow-hidden rounded-lg border border-border">
            <div
              className={`absolute inset-y-0 left-0 ${isWinner ? "bg-emerald-500/25" : "bg-brand/20"}`}
              style={{ width: `${pct}%` }}
            />
            <div className="relative flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
              <span className="flex items-center gap-2">
                {o.text}
                {o.id === myOptionId && <span className="rounded bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-brand-fg">YOU</span>}
                {isWinner && <CheckCircle2 className="size-4 text-emerald-500" aria-label="Actual outcome" />}
              </span>
              <span className="tabular-nums text-muted">{pct}% · {o.votes}</span>
            </div>
          </li>
        );
      })}
      <li className="text-xs text-muted">{total} total vote{total === 1 ? "" : "s"}</li>
    </ul>
  );
}