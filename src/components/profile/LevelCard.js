// Level ring: circular progress toward the next level. Server component, pure SVG.
const R = 46;
const CIRC = 2 * Math.PI * R;

export default function LevelCard({ level, solved, color, color2 }) {
  const pct = Math.max(0, Math.min(1, level.progress));
  return (
    <section aria-label="Level" className="card overflow-hidden p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">Level</p>
      <div className="mt-3 flex items-center gap-5">
        <div className="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 110 110" className="h-full w-full -rotate-90" role="img" aria-label={`${Math.round(pct * 100)}% of the way to the next level`}>
            <defs>
              <linearGradient id="lvl-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={color} />
                <stop offset="100%" stopColor={color2} />
              </linearGradient>
            </defs>
            <circle cx="55" cy="55" r={R} fill="none" stroke="var(--line)" strokeWidth="9" />
            <circle cx="55" cy="55" r={R} fill="none" stroke="url(#lvl-grad)" strokeWidth="9" strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - pct)} />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="text-2xl font-bold leading-none tabular-nums">{level.index + 1}</p>
              <p className="mt-0.5 text-[0.62rem] font-semibold uppercase tracking-wider text-muted">of 5</p>
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xl font-semibold tracking-tight">{level.name}</p>
          <p className="mt-1 text-sm text-muted">
            {level.next ? `${level.toNext} more solve${level.toNext === 1 ? '' : 's'} to reach ${level.next.name}.` : `Top level reached with ${solved} solved.`}
          </p>
        </div>
      </div>
    </section>
  );
}