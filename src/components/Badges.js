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
      <circle cx="12" cy="12" r="11" style={{ fill: "var(--tick-bg)" }} />
      <path d="M7 12.5l3.2 3.2L17 8.8" fill="none" style={{ stroke: "var(--tick-fg)" }} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// A 12-point scalloped seal, so the official tick has a different shape from the round blue tick.
const SEAL = (() => {
  const n = 12;
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? 11.5 : 9.6;
    const a = (Math.PI * i) / n - Math.PI / 2;
    pts.push(`${(12 + r * Math.cos(a)).toFixed(2)},${(12 + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
})();

// Only for posts by the Buncho team. Gold seal with a white check: not blue, not gray.
export function OfficialTick({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" role="img" aria-label="Official Buncho Team">
      <title>Official Buncho Team</title>
      <defs>
        <linearGradient id="buncho-official-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffc93c" />
          <stop offset="1" stopColor="#ff7a1a" />
        </linearGradient>
      </defs>
      <polygon points={SEAL} fill="url(#buncho-official-grad)" stroke="url(#buncho-official-grad)" strokeWidth="1" strokeLinejoin="round" />
      <path d="M7.6 12.4l3 3 5.8-6.4" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
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
        <span key={label} className="inline-flex items-center gap-1 rounded-full bg-mint-soft px-2.5 py-0.5 text-xs font-semibold text-mint">
          <Check /> {label}
        </span>
      ))}
    </>
  );
}