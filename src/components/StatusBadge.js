const MAP = {
  PENDING: { label: "In review", cls: "bg-amber-400/15 text-amber-300" },
  APPROVED: { label: "Live", cls: "bg-mint-soft text-mint" },
  REJECTED: { label: "Not approved", cls: "bg-red-500/15 text-red-300" },
};

export default function StatusBadge({ status }) {
  const s = MAP[status] ?? MAP.PENDING;
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>{s.label}</span>;
}