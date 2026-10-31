import Link from 'next/link';
import { Crown, ProBadge } from './ProBadge';

const PERKS = [
  'Full question, hints and step-by-step prompts',
  'AI feedback on your answer, scored against a rubric',
  'Reference answer with alternative approaches and trade-offs',
];

/**
 * Shown in place of locked content on a Pro-only question. Server component.
 * `signedIn` changes the call to action. `compact` is for narrow panes (the feedback tab).
 */
export default function ProLock({ signedIn, title = 'This is a Pro question', compact = false }) {
  const loginHref = `/login?redirect_url=${encodeURIComponent(`/pricing`)}`;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-400/60 bg-gradient-to-br from-amber-50 via-amber-100/70 to-white p-5 shadow-lg shadow-amber-500/10 dark:border-amber-400/40 dark:from-[#2d230a] dark:via-[#241c0a] dark:to-[#1d1a14] sm:p-6">
      <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-amber-400/25 blur-3xl" />
      <div className="relative flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-amber-950 shadow-md shadow-amber-500/30">
          <Crown width={22} height={22} />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            <ProBadge />
          </div>
          <p className="mt-1 text-sm text-muted">
            {compact
              ? 'Upgrade to Buncho Pro to unlock this.'
              : 'Pro questions are in-depth system design, case study and production scenarios. Upgrade to unlock the full question and everything that comes with it.'}
          </p>
          {!compact && (
            <ul className="mt-3 space-y-1.5 text-sm">
              {PERKS.map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  {p}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-amber-950 transition-colors hover:bg-amber-300"
            >
              <Crown width={14} height={14} /> Unlock with Pro
            </Link>
            {!signedIn && (
              <Link href={loginHref} className="text-sm font-semibold text-accent hover:underline">
                Log in
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}