// Experts waiting for an admin: new ones, and live ones who changed verified details.
export const REVIEW_WHERE = { OR: [{ status: "PENDING" }, { status: "ACTIVE", needsReview: true }] };

// Expert replies waiting for an admin to read them before the student gets them.
export const REPLY_OPEN = { status: { in: ["PENDING", "SEND_FAILED"] } };

export const FIELD_LABELS = {
  college: "college details",
  role: "role",
  company: "company",
  linkedin: "LinkedIn link",
  github: "GitHub link",
};