const MAP = {
  PENDING: { label: "In review", cls: "bg-amber-100 text-amber-800" },
  APPROVED: { label: "Live", cls: "bg-peacock-soft text-peacock" },
  REJECTED: { label: "Not approved", cls: "bg-red-100 text-red-700" },
};

export default function StatusBadge({ status }) {
  const s = MAP[status] ?? MAP.PENDING;
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>{s.label}</span>;
}
