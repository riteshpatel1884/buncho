const PROJECT = {
  PENDING_REVIEW: ["In review", "bg-warn-soft text-warn"],
  OPEN: ["Open", "bg-brand-soft text-brand"],
  AGREED: ["Awaiting payment", "bg-warn-soft text-warn"],
  IN_PROGRESS: ["In progress", "bg-brand-soft text-brand"],
  COMPLETED: ["Completed", "bg-mint-soft text-mint"],
  CLOSED: ["Closed", "bg-surface-2 text-muted"],
  REJECTED: ["Not published", "bg-danger-soft text-danger"],
};

const PROPOSAL = {
  ACTIVE: ["Negotiating", "bg-brand-soft text-brand"],
  AGREED: ["Agreed, awaiting payment", "bg-warn-soft text-warn"],
  IN_PROGRESS: ["Paid, in progress", "bg-brand-soft text-brand"],
  DELIVERED: ["Delivered", "bg-mint-soft text-mint"],
  COMPLETED: ["Completed", "bg-mint-soft text-mint"],
  DECLINED: ["Declined", "bg-danger-soft text-danger"],
  WITHDRAWN: ["Withdrawn", "bg-surface-2 text-muted"],
  CANCELLED: ["Cancelled", "bg-surface-2 text-muted"],
};

const badge = (map, status) => {
  const [label, cls] = map[status] ?? ["Unknown", "bg-surface-2 text-muted"];
  return <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>;
};

export const ProjectStatusBadge = ({ status }) => badge(PROJECT, status);
export const ProposalStatusBadge = ({ status }) => badge(PROPOSAL, status);