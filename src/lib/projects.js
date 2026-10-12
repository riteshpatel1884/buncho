import { inr } from "@/lib/constants";

export const BUDGET_MODES = {
  NEGOTIABLE: { label: "Negotiable", hint: "Experts can propose a higher or lower price." },
  FIXED: { label: "Fixed budget", hint: "Offers must stay inside your range." },
  OPEN: { label: "Open to offers", hint: "No budget yet. Experts tell you what it would cost." },
};

export const PRICE_MIN = 50;
export const PRICE_MAX = 100000;
export const DEADLINES = [1, 2, 3, 5, 7, 14, 30];
export const MAX_DELIVERABLES = 8;
export const MAX_TEXT = 2000;
export const ACTIVE_PROJECT_LIMIT = 5;
export const THREAD_OPEN = ["ACTIVE", "AGREED", "IN_PROGRESS", "DELIVERED"];

// Admin queues (used by the admin page and the navbar badge).
export const PROJECT_REVIEW_OPEN = { status: "PENDING_REVIEW" };
export const PROJECT_MESSAGE_OPEN = { reviewStatus: "PENDING_REVIEW" };
export const PROJECT_PAYOUT_DUE = { status: "COMPLETED", paymentStatus: "PAID", payoutReleasedAt: null };

// Buncho's cut, taken from the expert's side. The student pays exactly the agreed price.
const pct = Number.parseInt(process.env.PLATFORM_FEE_PCT ?? "10", 10);
export const PLATFORM_FEE_PCT = Number.isFinite(pct) ? Math.min(Math.max(pct, 0), 50) : 10;

export function feeSplit(priceInr) {
  const feeInr = Math.round((priceInr * PLATFORM_FEE_PCT) / 100);
  return { feePct: PLATFORM_FEE_PCT, feeInr, payoutInr: priceInr - feeInr };
}

export const days = (n) => `${n} ${n === 1 ? "day" : "days"}`;

export function budgetLabel(p) {
  if (p.budgetMode === "OPEN" || p.budgetMaxInr == null) return "Open to offers";
  return p.budgetMinInr === p.budgetMaxInr ? inr(p.budgetMaxInr) : `${inr(p.budgetMinInr)} to ${inr(p.budgetMaxInr)}`;
}

// Returns an error message, or null when the offer is fine.
export function offerError(project, price, deliveryDays) {
  if (!Number.isSafeInteger(price) || price < PRICE_MIN || price > PRICE_MAX) {
    return `Price must be between ${inr(PRICE_MIN)} and ${inr(PRICE_MAX)}.`;
  }
  if (!Number.isSafeInteger(deliveryDays) || deliveryDays < 1 || deliveryDays > 90) return "Delivery time must be 1 to 90 days.";
  if (project.budgetMode === "FIXED" && (price < project.budgetMinInr || price > project.budgetMaxInr)) {
    return `This project has a fixed budget of ${budgetLabel(project)}.`;
  }
  return null;
}