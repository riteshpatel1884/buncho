// Blue tick shown next to verified founders and products. It is paid for and has no effect on ranking.
import { useId } from "react";

// Rounded scalloped badge: 8 round lobes around the centre plus a filled core.
const LOBES = 8;
const LOBE_DISTANCE = 7.4;
const LOBE_RADIUS = 4.3;
const CORE_RADIUS = 9;

const LOBE_CENTERS = Array.from({ length: LOBES }, (_, i) => {
  const a = (i / LOBES) * Math.PI * 2;
  return {
    cx: +(12 + LOBE_DISTANCE * Math.cos(a)).toFixed(2),
    cy: +(12 + LOBE_DISTANCE * Math.sin(a)).toFixed(2),
  };
});

const BadgeShape = () => (
  <>
    <circle cx="12" cy="12" r={CORE_RADIUS} />
    {LOBE_CENTERS.map((c, i) => (
      <circle key={i} cx={c.cx} cy={c.cy} r={LOBE_RADIUS} />
    ))}
  </>
);

const CHECK = "M7.6 12.4l3 3 5.8-6.2";

const CSS = `
/* gentle sway, like the badge is catching the light */
.vb-sway {
  transform-box: view-box;
  transform-origin: 12px 12px;
  animation: vb-sway 6s ease-in-out infinite;
}
/* beam A enters from the left, beam B enters from the right */
.vb-beamA { animation: vb-a 6s cubic-bezier(0.45, 0, 0.25, 1) infinite; }
.vb-beamB { animation: vb-b 6s cubic-bezier(0.45, 0, 0.25, 1) infinite; }

@keyframes vb-sway {
  0%, 100% { transform: rotate(-4deg); }
  50% { transform: rotate(4deg); }
}
@keyframes vb-a {
  0% { transform: translateX(-18px); }
  36%, 100% { transform: translateX(42px); }
}
@keyframes vb-b {
  0%, 50% { transform: translateX(42px); }
  86%, 100% { transform: translateX(-18px); }
}

@media (prefers-reduced-motion: reduce) {
  .vb-sway, .vb-beamA, .vb-beamB { animation: none; }
  .vb-beamA, .vb-beamB { opacity: 0; }
}
`;

// Two skewed light beams. `fill` is the gradient used for the beam.
const Beams = ({ fill, wide = 9 }) => (
  <g transform="skewX(-20)">
    <g className="vb-beamA">
      <rect x="0" y="-6" width={wide} height="36" fill={fill} />
    </g>
    <g className="vb-beamB">
      <rect x="0" y="-6" width={wide} height="36" fill={fill} />
    </g>
  </g>
);

export default function VerifiedBadge({ className = "h-[18px] w-[18px]", label = "Verified" }) {
  const uid = "vb" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const clipId = `${uid}c`;
  const maskId = `${uid}m`;
  const bodyId = `${uid}b`;
  const beamId = `${uid}s`;
  const checkBeamId = `${uid}k`;

  return (
    <span title={label} className="inline-flex shrink-0 align-middle">
      <svg className={className} viewBox="0 0 24 24" role="img" aria-label={label} style={{ overflow: "visible" }}>
        <style>{CSS}</style>
        <defs>
          <linearGradient id={bodyId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#19c764" />
            <stop offset="1" stopColor="#2dbf6c" />
          </linearGradient>

          {/* soft white beam for the badge surface */}
          <linearGradient id={beamId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.75" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>

          {/* bright icy beam that lights up the checkmark */}
          <linearGradient id={checkBeamId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8fd8ff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#d9f3ff" stopOpacity="1" />
            <stop offset="1" stopColor="#8fd8ff" stopOpacity="0" />
          </linearGradient>

          <clipPath id={clipId}>
            <BadgeShape />
          </clipPath>

          {/* only the checkmark stroke is visible through this mask */}
          <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
            <path
              d={CHECK}
              fill="none"
              stroke="#fff"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </mask>
        </defs>

        <g className="vb-sway">
          {/* badge body */}
          <g fill={`url(#${bodyId})`}>
            <BadgeShape />
          </g>

          {/* beams sweeping over the badge */}
          <g clipPath={`url(#${clipId})`}>
            <Beams fill={`url(#${beamId})`} wide={10} />
          </g>

          {/* checkmark */}
          <path
            d={CHECK}
            fill="none"
            stroke="#0f1419"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* checkmark lights up as each beam passes over it */}
          <g mask={`url(#${maskId})`}>
            <Beams fill={`url(#${checkBeamId})`} wide={7} />
          </g>
        </g>
      </svg>
    </span>
  );
}