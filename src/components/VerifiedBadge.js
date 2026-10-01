// Blue tick shown next to verified founders and products. It is paid for and has no effect on ranking.

// Rounded scalloped badge: 8 round lobes around the centre plus a filled core.
const LOBES = 8;
const LOBE_DISTANCE = 7.4; // how far each lobe sits from the centre
const LOBE_RADIUS = 4.3; // roundness of each lobe (bigger = softer, flatter scallops)
const CORE_RADIUS = 9;

const LOBE_CENTERS = Array.from({ length: LOBES }, (_, i) => {
  const a = (i / LOBES) * Math.PI * 2;
  return {
    cx: +(12 + LOBE_DISTANCE * Math.cos(a)).toFixed(2),
    cy: +(12 + LOBE_DISTANCE * Math.sin(a)).toFixed(2),
  };
});

export default function VerifiedBadge({ className = "h-[18px] w-[18px]", label = "Verified" }) {
  return (
    <span title={label} className="inline-flex shrink-0 align-middle">
      <svg className={className} viewBox="0 0 24 24" role="img" aria-label={label}>
        <g fill="#34d67b">
          <circle cx="12" cy="12" r={CORE_RADIUS} />
          {LOBE_CENTERS.map((c, i) => (
            <circle key={i} cx={c.cx} cy={c.cy} r={LOBE_RADIUS} />
          ))}
        </g>
        <path
          d="M7.6 12.4l3 3 5.8-6.2"
          fill="none"
          stroke="#0f1419"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}