export default function WeeklyActivity({ weekly }) {
  const { days, weeks, answersThisWeek } = weekly;
  const maxDay = Math.max(1, ...days.map((d) => d.count));
  const maxWeek = Math.max(1, ...weeks);

  return (
    <section aria-label="Weekly activity" className="card p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-base font-semibold tracking-tight">This week</h2>
        <p className="text-sm text-muted">
          {answersThisWeek} {answersThisWeek === 1 ? 'answer' : 'answers'} evaluated
        </p>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-3" role="img" aria-label={`${answersThisWeek} answers evaluated in the last 7 days`}>
        {days.map((d) => (
          <div key={d.key} className="flex flex-col items-center gap-2">
            <div className="flex h-24 w-full items-end">
              <div
                title={`${d.key}: ${d.count}`}
                className={`w-full rounded-md ${d.count ? 'bg-accent' : 'bg-surface-2'}`}
                style={{ height: d.count ? `${Math.max(12, (d.count / maxDay) * 100)}%` : '6px' }}
              />
            </div>
            <span className="text-xs text-muted">{d.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-line pt-5">
        <p className="text-sm text-muted">Last 8 weeks</p>
        <div className="mt-3 flex h-12 items-end gap-2" role="img" aria-label="Answers evaluated per week over the last 8 weeks">
          {weeks.map((w, i) => (
            <div
              key={i}
              title={`${w} answers`}
              className={`flex-1 rounded-sm ${w ? 'bg-accent/70' : 'bg-surface-2'}`}
              style={{ height: w ? `${Math.max(12, (w / maxWeek) * 100)}%` : '4px' }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}