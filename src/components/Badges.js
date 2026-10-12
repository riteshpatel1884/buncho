function Check({ className = "h-3.5 w-3.5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

// Paid blue tick for verified experts.
export function isBlueTick(expert) {
  return (
    !!expert?.blueTickUntil &&
    new Date(expert.blueTickUntil) > new Date()
  );
}

export function BlueTick({ className = "h-5 w-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      role="img"
      aria-label="Verified expert"
    >
      <title>Verified expert</title>
      <circle
        cx="12"
        cy="12"
        r="11"
        style={{ fill: "var(--tick-bg)" }}
      />
      <path
        d="M7 12.5l3.2 3.2L17 8.8"
        fill="none"
        style={{ stroke: "var(--tick-fg)" }}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Official Buncho Team seal.
// Explicit colors avoid SVG gradient ID collisions when the profile
// card is rendered more than once, such as in desktop/mobile layouts.
const SEAL = (() => {
  const points = [];

  for (let i = 0; i < 24; i++) {
    const radius = i % 2 === 0 ? 11.5 : 9.6;
    const angle = (Math.PI * i) / 12 - Math.PI / 2;

    points.push(
      `${(12 + radius * Math.cos(angle)).toFixed(2)},` +
      `${(12 + radius * Math.sin(angle)).toFixed(2)}`
    );
  }

  return points.join(" ");
})();

export function OfficialTick({
  className = "h-5 w-5",
}) {
  return (
    <svg
      className={`block shrink-0 ${className}`}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      role="img"
      aria-label="Official Buncho Team"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Official Buncho Team</title>

      <polygon
        points={SEAL}
        fill="#FF9F1C"
        stroke="#FF9F1C"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      <path
        d="M7.6 12.4l3 3 5.8-6.4"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Label shown beside expert details that need re-verification.
export function NotVerified({ show }) {
  if (!show) return null;

  return (
    <span className="ml-2 inline-flex items-center rounded-full bg-warn-soft px-2 py-0.5 align-middle text-[11px] font-semibold text-warn">
      Not verified
    </span>
  );
}

// Education and employment verification badges.
export default function VerificationBadges({
  expert,
  showEmpty = false,
}) {
  const items = [
    expert.educationVerified && "Education verified",
    expert.employmentVerified && "Employment verified",
  ].filter(Boolean);

  if (items.length === 0) {
    return showEmpty ? (
      <span className="text-xs text-muted">
        Not verified yet
      </span>
    ) : null;
  }

  return (
    <>
      {items.map((label) => (
        <span
          key={label}
          className="inline-flex items-center gap-1 rounded-full bg-mint-soft px-2.5 py-0.5 text-xs font-semibold text-mint"
        >
          <Check />
          {label}
        </span>
      ))}
    </>
  );
}
