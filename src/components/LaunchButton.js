import Link from "next/link";

// The main "launch" call to action: orbiting border light, a soft sheen across the face,
// and a rocket that idles, revs up on hover and lifts off when pressed.
export default function LaunchButton({ children = "Launch your product", className = "" }) {
  return (
    <Link href="/submit" className={`btn-primary btn-ring btn-launch ${className}`}>
      <span className="launch-shine" aria-hidden="true" />
      <span className="relative z-10">{children}</span>
      <svg
        className="launch-rocket relative z-10 h-4 w-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </svg>
    </Link>
  );
}