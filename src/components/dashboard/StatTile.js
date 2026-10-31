export default function StatTile({ label, value, sub, accent = false, icon }) {
  return (
    <div className="card relative overflow-hidden p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      {accent && (
        <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-accent/15 blur-2xl" />
      )}
      <div className="relative flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
        {icon && <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-soft text-accent">{icon}</span>}
      </div>
      <p className={`relative mt-3 text-3xl font-semibold tabular-nums tracking-tight ${accent ? 'text-accent' : ''}`}>{value}</p>
      {sub && <p className="relative mt-1 text-sm text-muted">{sub}</p>}
    </div>
  );
}