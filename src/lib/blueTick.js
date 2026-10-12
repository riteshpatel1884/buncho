import { prisma } from "@/lib/prisma";
import { parseOrderId } from "@/lib/cashfree";

const DAY = 24 * 60 * 60 * 1000;

export const BLUE_TICK_PRICE_INR = Number(process.env.BLUE_TICK_PRICE_INR) || 99;
export const BLUE_TICK_DAYS = 30;
export const RENEW_WINDOW_DAYS = 7;

// A blue tick belongs to an expert profile (experts) or to the user account (everyone else).
// A "holder" is { type: "expert" | "user", id }.
const table = (holder) => (holder.type === "expert" ? prisma.expertProfile : prisma.user);

// You can buy when you have no tick, or when the current one ends within 7 days (adds 30 days on top).
export function canBuyBlueTick(until) {
  return !until || until.getTime() - Date.now() <= RENEW_WINDOW_DAYS * DAY;
}

// Saves a verified Cashfree payment ("paid" comes from getPaidOrder). Adds 30 days, once per order.
// opts.holder ({ type, id }) makes sure the payment belongs to the signed-in account.
export async function applyPayment(paid, opts = {}) {
  if (paid.currency !== "INR") return { ok: false, reason: "wrong-currency" };

  const parsed = parseOrderId(paid.orderId);
  if (!parsed || (parsed.prefix !== "be" && parsed.prefix !== "bu")) return { ok: false, reason: "not-blue-tick" };

  const holder = { type: parsed.prefix === "be" ? "expert" : "user", id: parsed.id };
  if (opts.holder && (opts.holder.type !== holder.type || opts.holder.id !== holder.id)) {
    return { ok: false, reason: "not-yours" };
  }

  const exists = await table(holder).findUnique({ where: { id: holder.id }, select: { id: true } });
  if (!exists) return { ok: false, reason: "no-holder" };

  if (paid.amountInr < BLUE_TICK_PRICE_INR) {
    console.error("[blue tick] amount too low", { orderId: paid.orderId, paid: paid.amountInr });
    return { ok: false, reason: "amount-mismatch" };
  }

  // One row per order, so the same payment is never counted twice.
  try {
    await prisma.blueTickPayment.create({
      data: { paymentId: paid.orderId, ...(holder.type === "expert" ? { expertId: holder.id } : { userId: holder.id }) },
    });
  } catch (e) {
    if (e.code === "P2002") return { ok: true, duplicate: true };
    throw e;
  }

  const current = await table(holder).findUnique({ where: { id: holder.id }, select: { blueTickUntil: true } });
  const base = current?.blueTickUntil && current.blueTickUntil > new Date() ? current.blueTickUntil : new Date();
  await table(holder).update({
    where: { id: holder.id },
    data: { blueTickUntil: new Date(base.getTime() + BLUE_TICK_DAYS * DAY) },
  });
  return { ok: true };
}