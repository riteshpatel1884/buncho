// Experts waiting for an admin: new ones, and live ones who changed verified details.
export const REVIEW_WHERE = { OR: [{ status: "PENDING" }, { status: "ACTIVE", needsReview: true }] };

// Expert replies waiting for an admin to read them before the student gets them.
export const REPLY_OPEN = { status: { in: ["PENDING", "SEND_FAILED"] } };

// Cancelled or declined bookings where the student paid and the money is not yet returned or settled.
export const REFUND_OPEN = {
  status: { in: ["CANCELLED", "DECLINED"] },
  paymentStatus: { in: ["PAID", "REFUND_FAILED"] },
  resolvedAt: null,
};

export const FIELD_LABELS = {
  college: "college details",
  role: "role",
  company: "company",
  linkedin: "LinkedIn link",
  github: "GitHub link",
};