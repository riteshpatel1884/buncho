function Check({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

// Education / employment checks done by Buncho. Self-declared details are not badged.
export default function VerificationBadges({ expert, showEmpty = false }) {
  const items = [
    expert.educationVerified && "Education verified",
    expert.employmentVerified && "Employment verified",
  ].filter(Boolean);

  if (items.length === 0) {
    return showEmpty ? <span className="text-xs text-muted">Not verified yet</span> : null;
  }
  return (
    <>
      {items.map((label) => (
        <span key={label} className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand">
          <Check /> {label}
        </span>
      ))}
    </>
  );
}
