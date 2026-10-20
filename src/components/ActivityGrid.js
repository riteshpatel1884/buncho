import { dayKey } from '@/lib/problems';
import { Flame } from './icons';

// Rolling 12-week practice grid (newest day bottom-right) plus the current streak.
export default function ActivityGrid({ stats, weeks = 12, className = '' }) {
  const n = weeks * 7;
  const now = Date.now();
  const cells = Array.from({ length: n }, (_, i) => {
    const key = dayKey(new Date(now - (n - 1 - i) * 86400000));
    return { key, count: stats.activeDays[key] ?? 0 };
  });
  const active = cells.filter((c) => c.count > 0).length;
  const level = (c) =>
    c === 0 ? 'bg-surface-2' : c === 1 ? 'bg-accent/40' : c === 2 ? 'bg-accent/70' : 'bg-accent';

  return (
    <section aria-label="Practice activity" className={`panel p-4 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">Practice activity</p>
        <p className="flex items-center gap-1.5 text-sm font-medium">
          <Flame width={16} height={16} className={stats.streak ? 'text-accent' : 'text-muted'} />
          {stats.streak} day streak
        </p>
      </div>
      <div className="mt-3 grid grid-flow-col grid-rows-7 gap-1" role="img" aria-label={`${active} active days in the last ${weeks} weeks`}>
        {cells.map((c) => (
          <span key={c.key} title={`${c.key}: ${c.count} ${c.count === 1 ? 'problem' : 'problems'}`} className={`aspect-square rounded-[3px] ${level(c.count)}`} />
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">{active} active days in the last {weeks} weeks</p>
    </section>
  );
}
