export default function Logo() {
  return (
    <span className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M8 5 3 12l5 7" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 5l5 7-5 7" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.5 4 10.5 20" stroke="var(--muted)" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      buncho
    </span>
  );
}