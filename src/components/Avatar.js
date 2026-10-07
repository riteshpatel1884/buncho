import { initials } from "@/lib/utils";

export default function Avatar({ name, src, size = 48 }) {
  const style = { width: size, height: size };
  if (src) {
    return <img src={src} alt="" style={style} className="shrink-0 rounded-full border border-line object-cover" />;
  }
  return (
    <span
      style={{ ...style, fontSize: size * 0.36 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-mint-soft font-display font-bold text-mint"
    >
      {initials(name)}
    </span>
  );
}
