// Earned badges. Locked ones are only shown to the owner, as goals.
export default function BadgeGrid({ badges, showLocked = false }) {
  const earned = badges.filter((b) => b.earned);
  const items = showLocked ? badges : earned;
  if (!items.length) return null;

  return (
    <section aria-label="Badges" className="card p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold tracking-tight">Badges</h2>
        <p className="text-sm text-muted">{earned.length} of {badges.length}</p>
      </div>
      <ul className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-3">
        {items.map((b) => (
          <li
            key={b.id}
            title={`${b.name}: ${b.desc}`}
            className={`flex flex-col items-center rounded-xl border px-2 py-3 text-center ${b.earned ? 'border-line bg-surface-2' : 'border-dashed border-line opacity-45'}`}
          >
            <span aria-hidden="true" className={`text-2xl ${b.earned ? '' : 'grayscale'}`}>{b.icon}</span>
            <span className="mt-1.5 text-[0.7rem] font-semibold leading-tight">{b.name}</span>
            <span className="sr-only">{b.earned ? 'Earned. ' : 'Locked. '}{b.desc}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}