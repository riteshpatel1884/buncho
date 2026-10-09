function Check({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

// Paid blue tick (₹99/month via Dodo Payments). Only experts have this field, so students can never show it.
// It is active only while blueTickUntil is in the future, so it disappears on its own if payments stop.
export function isBlueTick(expert) {
  return !!expert?.blueTickUntil && new Date(expert.blueTickUntil) > new Date();
}

export function BlueTick({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" role="img" aria-label="Verified expert">
      <title>Verified expert</title>
      <circle cx="12" cy="12" r="11" fill="#164d25" />
      <path d="M7 12.5l3.2 3.2L17 8.8" fill="none" stroke="#31ca74" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Small label shown next to details the expert changed after Buncho checked them.
export function NotVerified({ show }) {
  if (!show) return null;
  return (
    <span className="ml-2 inline-flex items-center rounded-full bg-warn-soft px-2 py-0.5 align-middle text-[11px] font-semibold text-warn">
      Not verified
    </span>
  );
}

// Education / employment checks done by Buncho. Self-declared details are not badged.
// The blue tick is separate: it is a paid mark and is shown next to the name, not in this list.
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