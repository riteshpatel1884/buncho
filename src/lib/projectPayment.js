import { prisma } from "@/lib/prisma";
import { createCheckout, newOrderId, parseOrderId, refundOrder } from "@/lib/cashfree";
import { emailAdmin, emailProjectPaid } from "@/lib/email";
import { feeSplit, PRICE_MIN, PRICE_MAX } from "@/lib/projects";

// Creates a Cashfree order for the agreed price and returns the checkout URL.
// The amount always comes from the database.
export async function createProposalCheckout({ proposal, user }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL is not set");

  const price = proposal.agreedPriceInr;
  if (!Number.isSafeInteger(price) || price < PRICE_MIN || price > PRICE_MAX) throw new Error("Invalid agreed price");
  if (proposal.status !== "AGREED" || proposal.paymentStatus !== "UNPAID") throw new Error("Not awaiting payment");

  return createCheckout({
    orderId: newOrderId("pj", proposal.id),
    amountInr: price,
    user,
    returnUrl: `${appUrl}/projects/${proposal.projectId}/p/${proposal.id}?paid=1&order_id={order_id}`,
    note: "Buncho project payment",
    expiryMinutes: 60,
  });
}

export async function refundProposal(proposal) {
  if (proposal.paymentStatus !== "PAID" || !proposal.cashfreeOrderId) return;
  try {
    await refundOrder(proposal.cashfreeOrderId, "Project cancelled");
    await prisma.projectProposal.update({ where: { id: proposal.id }, data: { paymentStatus: "REFUNDED" } });
  } catch (e) {
    console.error("[project refund] failed:", proposal.id, e?.message);
    await prisma.projectProposal.update({ where: { id: proposal.id }, data: { paymentStatus: "REFUND_FAILED" } });
  }
}

// Applies a verified Cashfree payment ("paid" comes from getPaidOrder). Safe to call twice.
export async function applyProjectPayment(paid) {
  if (paid.currency !== "INR") return { ok: false, reason: "wrong-currency" };
  const parsed = parseOrderId(paid.orderId);
  if (!parsed || parsed.prefix !== "pj") return { ok: false, reason: "not-project" };

  const proposal = await prisma.projectProposal.findUnique({
    where: { id: parsed.id },
    include: { project: { select: { title: true } }, expert: { select: { user: { select: { email: true } } } } },
  });
  if (!proposal) return { ok: false, reason: "no-proposal" };
  if (proposal.paymentStatus !== "UNPAID") return { ok: true, duplicate: true };

  if (!proposal.agreedPriceInr || paid.amountInr !== proposal.agreedPriceInr) {
    console.error("[project payment] amount mismatch", { proposal: proposal.id, expected: proposal.agreedPriceInr, paid: paid.amountInr, orderId: paid.orderId });
    await emailAdmin({
      subject: "Project payment needs a manual check",
      lines: [`Order ${paid.orderId} for "${proposal.project.title}" did not match the agreed price (expected ₹${proposal.agreedPriceInr}, got ₹${paid.amountInr}).`, "The project was NOT marked as paid."],
      path: "/admin/projects",
    });
    return { ok: false, reason: "amount-mismatch" };
  }

  const fee = feeSplit(proposal.agreedPriceInr);
  const paidData = { paymentStatus: "PAID", cashfreeOrderId: paid.orderId, paidAt: new Date(), ...fee };

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
  await refundProposal({ id: proposal.id, paymentStatus: "PAID", cashfreeOrderId: paid.orderId });
  return { ok: true, refunded: true };
}