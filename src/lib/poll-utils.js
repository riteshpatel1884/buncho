export const DURATIONS = {
  "1h": { label: "1 hour", ms: 3_600_000 },
  "6h": { label: "6 hours", ms: 21_600_000 },
  "24h": { label: "24 hours", ms: 86_400_000 },
  "3d": { label: "3 days", ms: 259_200_000 },
  "7d": { label: "7 days", ms: 604_800_000 },
};

export const POLL_TYPES = {
  OPINION: { label: "Opinion", cls: "bg-sky-500/15 text-sky-600 dark:text-sky-300" },
  PREDICTION: { label: "Prediction", cls: "bg-violet-500/15 text-violet-600 dark:text-violet-300" },
  CROWD_QUESTION: { label: "Crowd question", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
};

export const STATUS_STYLES = {
  OPEN: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  CLOSED: "bg-zinc-500/15 text-muted",
  RESOLVED: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
  CANCELLED: "bg-red-500/15 text-red-500",
};

// Status is derived on read, so deadlines never depend on a cron job being on time.
export function effectiveStatus(poll) {
  if (poll.status === "RESOLVED" || poll.status === "CANCELLED") return poll.status;
  return new Date(poll.closesAt).getTime() <= Date.now() ? "CLOSED" : "OPEN";
}

export function timeLeft(closesAt) {
  const ms = new Date(closesAt).getTime() - Date.now();
  if (ms <= 0) return "Closed";
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h left`;
  if (h > 0) return `${h}h ${m % 60}m left`;
  return `${Math.max(m, 1)}m left`;
}
