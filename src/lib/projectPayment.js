import { prisma } from "@/lib/prisma";
import { dodo } from "@/lib/dodo";
import { emailAdmin, emailProjectPaid } from "@/lib/email";
import { feeSplit, PRICE_MIN, PRICE_MAX } from "@/lib/projects";

// Creates a Dodo checkout for the agreed price. Reuses the "pay what you want" INR product
// from bookings (DODO_SESSION_PRODUCT_ID). The amount always comes from the database.
export async function createProposalCheckout({ proposal, user }) {
  const productId = process.env.DODO_SESSION_PRODUCT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!productId) throw new Error("DODO_SESSION_PRODUCT_ID is not set");
  if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL is not set");

  const price = proposal.agreedPriceInr;
  if (!Number.isSafeInteger(price) || price < PRICE_MIN || price > PRICE_MAX) throw new Error("Invalid agreed price");
  if (proposal.status !== "AGREED" || proposal.paymentStatus !== "UNPAID") throw new Error("Not awaiting payment");

  const session = await dodo.checkoutSessions.create({
    product_cart: [{ product_id: productId, quantity: 1, amount: price * 100 }],
    customer: { email: user.email, ...(user.name ? { name: user.name } : {}) },
    metadata: { type: "project", proposalId: proposal.id },
    return_url: `${appUrl}/projects/${proposal.projectId}/p/${proposal.id}?paid=1`,
  });
  if (!session.checkout_url) throw new Error("Dodo did not return a checkout URL");
  return session.checkout_url;
}

export async function refundProposal(proposal) {
  if (proposal.paymentStatus !== "PAID" || !proposal.dodoPaymentId) return;
  try {
    await dodo.refunds.create({ payment_id: proposal.dodoPaymentId, reason: "Project cancelled" });
    await prisma.projectProposal.update({ where: { id: proposal.id }, data: { paymentStatus: "REFUNDED" } });
  } catch (e) {
    console.error("[project refund] failed:", proposal.id, e?.message);
    await prisma.projectProposal.update({ where: { id: proposal.id }, data: { paymentStatus: "REFUND_FAILED" } });
  }
}

// Amount actually paid, in paise. CHECK the real field name in a test-mode webhook payload:
// if neither field exists we return null and refuse to mark the project paid.
function paidPaise(payment) {
  const v = payment.total_amount ?? payment.amount;
  return v == null || !Number.isFinite(Number(v)) ? null : Number(v);
}

// Applies a succeeded Dodo payment to its proposal. Safe to call twice for the same payment.
export async function applyProjectPayment(payment) {
  if (String(payment.status).toLowerCase() !== "succeeded") return { ok: false, reason: "not-succeeded" };
  if (String(payment.currency).toUpperCase() !== "INR") return { ok: false, reason: "wrong-currency" };
  const id = payment.metadata?.proposalId;
  if (payment.metadata?.type !== "project" || !id) return { ok: false, reason: "not-project" };
  if (!payment.payment_id) return { ok: false, reason: "missing-payment-id" };

  const proposal = await prisma.projectProposal.findUnique({
    where: { id: String(id) },
    include: { project: { select: { title: true } }, expert: { select: { user: { select: { email: true } } } } },
  });
  if (!proposal) return { ok: false, reason: "no-proposal" };
  if (proposal.paymentStatus !== "UNPAID") return { ok: true, duplicate: true };

  // The Dodo product is "pay what you want", so the buyer can edit the amount. Check it here.
  const expected = (proposal.agreedPriceInr ?? 0) * 100;
  const paid = paidPaise(payment);
  if (!expected || paid === null || paid < expected) {
    console.error("[project payment] amount mismatch", { proposal: proposal.id, expected, paid, payment_id: payment.payment_id });
    await emailAdmin({
      subject: "Project payment needs a manual check",
      lines: [`Payment ${payment.payment_id} for "${proposal.project.title}" did not match the agreed price (expected ${expected} paise, got ${paid}).`, "The project was NOT marked as paid."],
      path: "/admin/projects",
    });
    return { ok: false, reason: "amount-mismatch" };
  }

  const fee = feeSplit(proposal.agreedPriceInr);
  const paidData = { paymentStatus: "PAID", dodoPaymentId: payment.payment_id, paidAt: new Date(), ...fee };

  const won = await prisma.projectProposal.updateMany({
    where: { id: proposal.id, paymentStatus: "UNPAID", status: "AGREED" },
    data: { ...paidData, status: "IN_PROGRESS" },
  });
  if (won.count === 1) {
    await prisma.project.update({ where: { id: proposal.projectId }, data: { status: "IN_PROGRESS" } });
    await emailProjectPaid({ to: proposal.expert.user.email, title: proposal.project.title, path: `/projects/${proposal.projectId}/p/${proposal.id}` });
    return { ok: true };
  }

  // Paid after the proposal was cancelled: record it and give the money back.
  const late = await prisma.projectProposal.updateMany({ where: { id: proposal.id, paymentStatus: "UNPAID" }, data: paidData });
  if (late.count === 0) return { ok: true, duplicate: true };
  await refundProposal({ id: proposal.id, paymentStatus: "PAID", dodoPaymentId: payment.payment_id });
  return { ok: true, refunded: true };
}