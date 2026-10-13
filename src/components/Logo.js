// Buncho logo: rounded "b" mark and wordmark.
export default function Logo({ className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 font-logo text-xl font-bold tracking-tight ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-lg leading-none text-on-brand">b</span>
      <span>buncho<span className="text-brand">.</span></span>
    </span>
  );
}

// Just the rounded "b" mark, at any size. Used as the avatar for official Buncho posts.
export function LogoMark({ size = 32, className = "" }) {
  return (
    <span
      style={{ width: size, height: size, fontSize: size * 0.56 }}
      className={`flex shrink-0 items-center justify-center rounded-[28%] bg-brand font-logo font-bold leading-none text-on-brand ${className}`}
      role="img"
      aria-label="Buncho"
    >
      b
    </span>
  );
}