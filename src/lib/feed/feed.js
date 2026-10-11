export const TOPICS = { CAREER: "Career", PLACEMENTS: "Placements", RESEARCH: "Research", TECHNOLOGY: "Technology" };
export const PAGE_SIZE = 10;
export const MAX_POST = 1500;
export const MAX_COMMENT = 500;

export function timeAgo(iso) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }).format(new Date(iso));
}