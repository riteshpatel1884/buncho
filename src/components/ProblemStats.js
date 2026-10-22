import Link from 'next/link';
import { Flame } from './icons';

const ROWS = [
  ['EASY', 'Easy', 'bg-easy'],
  ['MEDIUM', 'Medium', 'bg-medium'],
  ['HARD', 'Hard', 'bg-hard'],
];

function Ring({ solved, total, size = 128 }) {
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = total ? Math.min(1, solved / total) : 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: 'var(--easy)' }} />
            <stop offset="100%" style={{ stopColor: 'var(--accent)' }} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-3xl font-semibold leading-none tabular-nums">{solved}</p>
          <p className="mt-1.5 text-xs text-muted">of {total}</p>
          <p className="text-[0.7rem] font-semibold text-easy">Solved</p>
        </div>
      </div>
    </div>
  );
}

export function ProgressCard({ stats, signedIn }) {
  const pct = stats.total ? Math.round((stats.solved / stats.total) * 100) : 0;

  return (
    <section aria-label="Your progress" className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <Ring solved={stats.solved} total={stats.total} />

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold">Your progress</h2>
            <span className="text-xs text-muted">{pct}% complete</span>
          </div>
          <ul className="mt-4 space-y-3.5">
            {ROWS.map(([key, label, bar]) => {
              const d = stats.byDifficulty[key];
              const w = d.total ? Math.round((d.solved / d.total) * 100) : 0;
              return (
                <li key={key}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{label}</span>
                    <span className="tabular-nums text-muted">
                      {d.solved}/{d.total}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
                    <div className={`h-full rounded-full ${bar}`} style={{ width: `${w}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {signedIn ? (
        <p className="mt-5 flex items-center gap-2 text-xs text-muted">
          <span className="h-2 w-2 rounded-full bg-accent" /> {Math.max(0, stats.total - stats.solved)} left to solve
        </p>
      ) : (
        <Link
          href="/register"
          className="mt-5 block rounded-xl bg-accent px-3 py-2.5 text-center text-sm font-semibold text-accent-ink hover:opacity-90"
        >
          Sign up to track your progress
        </Link>
      )}
    </section>
  );
}

export function NextUpCard({ stats, signedIn }) {
  const card = 'flex flex-col justify-between rounded-2xl border border-line bg-gradient-to-br from-accent-soft to-surface p-5 sm:p-6';
  const primary = 'inline-flex items-center rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-ink hover:opacity-90';

  if (!signedIn) {
    return (
      <section aria-label="Get started" className={card}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Get started</p>
          <h2 className="mt-2 text-lg font-semibold leading-snug">Create your free account</h2>
          <p className="mt-1 text-sm text-muted">Save your answers, get AI feedback and build a daily streak.</p>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link href="/register" className={primary}>Sign up</Link>
          <Link href="/problems?difficulty=EASY" className="text-sm font-medium text-muted hover:text-ink">
            Browse Easy questions
          </Link>
        </div>
      </section>
    );
  }

  const started = stats.solved > 0;

  return (
    <section aria-label="Next problem" className={card}>
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            {started ? 'Keep going' : 'Start practising'}
          </p>
          {stats.streak > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-medium">
              <Flame width={14} height={14} /> {stats.streak} day streak
            </span>
          )}
        </div>

        <h2 className="mt-2 text-lg font-semibold leading-snug">{started ? 'Pick your next problem' : 'Try your first problem'}</h2>
        <p className="mt-1 text-sm text-muted">
          {started
            ? 'Submit an answer to get AI feedback and mark the problem solved.'
            : 'Short Easy questions are a good warm-up, and you can dictate your answer.'}
        </p>
      </div>

      <div className="mt-5">
        <Link href={started ? '/problems' : '/problems?difficulty=EASY'} className={primary}>
          {started ? 'Browse problems' : 'Browse Easy problems'}
        </Link>
      </div>
    </section>
  );
}