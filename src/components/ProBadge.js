// Gold "PRO" pill and crown. Safe to use in server and client components.
export function Crown(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M3 7l4.5 4L12 4l4.5 7L21 7l-2 11H5L3 7zm2.4 13h13.2v2H5.4v-2z" />
    </svg>
  );
}

export function ProBadge({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 px-2 py-0.5 text-[0.65rem] font-extrabold uppercase leading-none tracking-wider text-amber-950 shadow-sm shadow-amber-500/30 ${className}`}
    >
      <Crown width={11} height={11} /> Pro
    </span>
  );
}