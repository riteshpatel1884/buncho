export default function WeeklyActivity({ weekly }) {
  const { days, weeks, answersThisWeek } = weekly;
  const maxDay = Math.max(1, ...days.map((d) => d.count));
  const maxWeek = Math.max(1, ...weeks);

  return (
    <section aria-label="Weekly activity" className="panel p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold">This week</p>
        <p className="text-xs text-muted">
          {answersThisWeek} {answersThisWeek === 1 ? 'answer' : 'answers'} evaluated
        </p>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2" role="img" aria-label={`${answersThisWeek} answers evaluated in the last 7 days`}>
        {days.map((d) => (
          <div key={d.key} className="flex flex-col items-center gap-1.5">
            <div className="flex h-20 w-full items-end">
              <div
                title={`${d.key}: ${d.count}`}
                className={`w-full rounded-md ${d.count ? 'bg-accent' : 'bg-surface-2'}`}
                style={{ height: d.count ? `${Math.max(12, (d.count / maxDay) * 100)}%` : '6px' }}
              />
            </div>
            <span className="text-[0.65rem] text-muted">{d.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-line pt-3">
        <p className="text-xs text-muted">Last 8 weeks</p>
        <div className="mt-2 flex h-10 items-end gap-1.5" role="img" aria-label="Answers evaluated per week over the last 8 weeks">
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