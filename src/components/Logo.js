// Buncho logo: rounded "b" mark and wordmark.
export default function Logo({ className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 font-logo text-xl font-bold tracking-tight ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-lg leading-none text-on-brand">b</span>
      <span>buncho<span className="text-brand">.</span></span>
    </span>
  );
}