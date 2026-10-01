// Blue tick shown next to verified founders and products. It is paid for and has no effect on ranking.
export default function VerifiedBadge({ className = "h-[18px] w-[18px]", label = "Verified" }) {
  return (
    <span title={label} className="inline-flex shrink-0 align-middle">
      <svg className={className} viewBox="0 0 24 24" role="img" aria-label={label}>
        <circle cx="12" cy="12" r="11" fill="#2f9bff" />
        <path d="M7.4 12.4l3.2 3.2 6-6.4" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}