// The Buncho logo: green "b" mark and the wordmark. Unchanged from the original, now in one place.
export default function Logo({ className = "" }) {
  return (
    <span className={`group inline-flex items-center gap-2 font-logo text-xl font-bold ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-on-brand transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110">b</span>
      <span>buncho<span className="text-brand">.</span></span>
    </span>
  );
}