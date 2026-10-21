export default function StatTile({ label, value, sub, accent = false }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
      <p className={`mt-3 text-3xl font-semibold tabular-nums tracking-tight ${accent ? 'text-accent' : ''}`}>{value}</p>
      {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
    </div>
  );
}