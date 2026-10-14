export const TOPICS = { CAREER: "Career", PLACEMENTS: "Placements", RESEARCH: "Research", TECHNOLOGY: "Technology" };
export const PAGE_SIZE = 10;

// Sort options shown when a feed tab is tapped. "latest" is the default.
export const SORTS = { latest: "Latest", oldest: "Oldest", popular: "Most popular" };
// Tabs that get the sort menu.
export const SORTABLE_TABS = ["for-you", "following", "mine"];
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

// Label for a post's header. Inside the first 24 hours it is just "just now", "25m ago" or "5h ago".
// After that it adds the date it was posted, then how many days ago: "9 Oct · 4 days ago".
// (The year only appears for posts from an earlier year.)
export function postedLabel(iso) {
  const then = new Date(iso);
  const s = Math.max(1, Math.floor((Date.now() - then.getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  const tz = "Asia/Kolkata";
  const sameYear = new Intl.DateTimeFormat("en-IN", { year: "numeric", timeZone: tz }).format(then) === new Intl.DateTimeFormat("en-IN", { year: "numeric", timeZone: tz }).format(new Date());
  const date = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", ...(sameYear ? {} : { year: "numeric" }), timeZone: tz }).format(then);
  return `${date} · ${d} ${d === 1 ? "day" : "days"} ago`;
}
// Public profile address: buncho.live/<username>. Accounts without a username fall back to /u/<id>.
export const profilePath = (a) => (a?.username ? `/${a.username}` : `/u/${a.id}`);