const MAP = {
  PENDING: ["Pending", "bg-warn-soft text-warn"],
  CONFIRMED: ["Confirmed", "bg-brand-soft text-brand"],
  COMPLETED: ["Completed", "bg-mint-soft text-mint"],
  CANCELLED: ["Cancelled", "bg-surface-2 text-muted"],
  DECLINED: ["Declined", "bg-danger-soft text-danger"],
  ACTIVE: ["Live", "bg-brand-soft text-brand"],
  SUSPENDED: ["Suspended", "bg-danger-soft text-danger"],
  REVIEW: ["Under review", "bg-warn-soft text-warn"],
};

export default function StatusBadge({ status }) {
  const [label, cls] = MAP[status] ?? MAP.PENDING;
  return <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>;
}
