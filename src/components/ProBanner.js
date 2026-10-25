import Link from 'next/link';
import { Crown, ProBadge } from './ProBadge';
import Popup from './Popup';
import PlanDetails from './billing/PlanDetails';

const PERKS = ['Unlimited mock assessments', 'Company-wise insights', 'Question frequency data', 'Advanced revision'];
const dateFmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });

/** Premium strip shown to active Pro users (dashboard). "Plan details" opens the plan as a popup. */
export default function ProBanner({ periodEnd }) {
  const end = new Date(periodEnd);
  const daysLeft = Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86400000));
  const soon = daysLeft <= 5;

  return (
    <section
      aria-label="Buncho Pro"
      className="relative overflow-hidden rounded-2xl border border-amber-400/60 bg-gradient-to-br from-amber-50 via-amber-100/70 to-white p-5 shadow-lg shadow-amber-500/10 dark:border-amber-400/40 dark:from-[#2d230a] dark:via-[#241c0a] dark:to-[#1d1a14] sm:p-6"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-400/25 blur-3xl" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-amber-950 shadow-md shadow-amber-500/30">
            <Crown width={24} height={24} />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight">You&rsquo;re on Buncho Pro</h2>
              <ProBadge />
            </div>
            <p className="mt-1 text-sm text-muted">
              Active until <span className="font-semibold text-ink">{dateFmt(end)}</span> ·{' '}
              <span className={soon ? 'font-semibold text-medium' : ''}>
                {daysLeft} day{daysLeft === 1 ? '' : 's'} left
              </span>
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {PERKS.map((p) => (
                <li key={p} className="rounded-full border border-amber-400/40 bg-white/60 px-2.5 py-0.5 text-xs font-medium dark:bg-black/20">
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
          <Popup
            title="Your plan"
            subtitle="Buncho Pro"
            buttonLabel="Plan details"
            buttonClassName="inline-flex items-center justify-center rounded-full border border-amber-500/50 bg-white/60 px-5 py-2.5 text-sm font-semibold transition hover:bg-white dark:bg-black/20 dark:hover:bg-black/30"
          >
            <PlanDetails periodEnd={periodEnd} />
          </Popup>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 px-5 py-2.5 text-sm font-bold text-amber-950 shadow-md shadow-amber-500/30 transition hover:-translate-y-0.5 hover:opacity-95"
          >
            {soon ? 'Renew now' : 'Extend Pro'}
          </Link>
        </div>
      </div>
    </section>
  );
}