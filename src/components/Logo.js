export default function Logo() {
  return (
    <span className="inline-flex items-center gap-2 font-display text-xl font-bold tracking-tight">
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
        <circle cx="10" cy="10" r="7" fill="var(--accent)" />
        <circle cx="19" cy="11" r="5.5" fill="var(--mark)" />
        <circle cx="13.5" cy="19.5" r="6" fill="var(--ink)" fillOpacity="0.88" />
      </svg>
      buncho
    </span>
  );
}
