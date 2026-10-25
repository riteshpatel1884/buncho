import Link from 'next/link';
import { Crown } from './ProBadge';

const dateFmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });

/** One calm status row for active Pro users (dashboard). Perks live in the Plan card, not here. */
export default function ProBanner({ periodEnd }) {
  const end = new Date(periodEnd);
  const daysLeft = Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86400000));
  const soon = daysLeft <= 5;

  return (
    <section
      aria-label="Buncho Pro"
      className="flex flex-col gap-4 rounded-2xl border border-amber-400/50 bg-gradient-to-r from-amber-50 via-white to-white p-4 shadow-sm shadow-amber-500/10 dark:border-amber-400/35 dark:from-amber-400/10 dark:via-surface dark:to-surface dark:shadow-none sm:flex-row sm:items-center sm:gap-5 sm:px-5"
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-amber-950 shadow-sm shadow-amber-500/30">
          <Crown width={22} height={22} />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight">You&rsquo;re on Buncho Pro</h2>
          <p className="mt-0.5 text-sm text-muted">
            Active until <span className="font-semibold text-ink">{dateFmt(end)}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:shrink-0">
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold tabular-nums ${
            soon ? 'border-medium/40 bg-medium/10 text-medium' : 'border-line bg-surface-2/60 text-muted'
          }`}
        >
          {daysLeft} day{daysLeft === 1 ? '' : 's'} left
        </span>
        <Link
          href="/pricing"
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 px-5 py-2 text-sm font-bold text-amber-950 shadow-sm shadow-amber-500/30 transition hover:opacity-90"
        >
          {soon ? 'Renew now' : 'Extend Pro'}
        </Link>
      </div>
    </section>
  );
}