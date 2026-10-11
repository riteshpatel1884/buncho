// Experts waiting for an admin: new ones, and live ones who changed verified details.
export const REVIEW_WHERE = { OR: [{ status: "PENDING" }, { status: "ACTIVE", needsReview: true }] };
// Reports an admin has not dealt with yet.
export const REPORT_OPEN = { status: "OPEN" };
// Expert replies waiting for an admin to read them before the student gets them.
export const REPLY_OPEN = { status: { in: ["PENDING", "SEND_FAILED"] } };

// Cancelled or declined bookings where the student paid and the money is not yet returned or settled.
export const REFUND_OPEN = {
  status: { in: ["CANCELLED", "DECLINED"] },
  paymentStatus: { in: ["PAID", "REFUND_FAILED"] },
  resolvedAt: null,
};

// Student requests (paid or free) waiting for an admin to read them before the expert sees them.
export const REQUEST_OPEN = {
  status: "PENDING",
  reviewStatus: "PENDING_REVIEW",
  paymentStatus: { in: ["PAID", "FREE"] },
};

// Completed paid sessions where the expert has not been paid out yet.
export const PAYOUT_DUE = { status: "COMPLETED", paymentStatus: "PAID", payoutReleasedAt: null };

export const FIELD_LABELS = {
  college: "college details",
  role: "role",
  company: "company",
  linkedin: "LinkedIn link",
  github: "GitHub link",
};