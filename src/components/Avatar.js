import { initials } from "@/lib/utils";

// Rounded squares, the same shape as the "b" in the logo.
export default function Avatar({ name, src, size = 48 }) {
  const style = { width: size, height: size };
  if (src) {
    return <img src={src} alt="" style={style} className="shrink-0 rounded-[28%] border border-line object-cover" />;
  }
  return (
    <span
      style={{ ...style, fontSize: size * 0.38 }}
      className="flex shrink-0 items-center justify-center rounded-[28%] bg-brand-soft font-display text-brand"
    >
      {initials(name)}
    </span>
  );
}