import { prisma } from "@/lib/prisma";
import { dodo } from "@/lib/dodo";

const DAY = 24 * 60 * 60 * 1000;

// Finds which expert a Dodo subscription belongs to.
async function findExpertId(sub) {
  const metaId = sub.metadata?.expertId;
  if (metaId) {
    const e = await prisma.expertProfile.findUnique({ where: { id: String(metaId) }, select: { id: true } });
    if (e) return e.id;
  }
  if (sub.subscription_id) {
    const e = await prisma.expertProfile.findUnique({ where: { dodoSubscriptionId: sub.subscription_id }, select: { id: true } });
    if (e) return e.id;
  }
  const email = sub.customer?.email;
  if (email) {
    const e = await prisma.expertProfile.findFirst({
      where: { user: { email: { equals: email, mode: "insensitive" } } },
      select: { id: true },
    });
    if (e) return e.id;
  }
  return null;
}

// Saves a Dodo subscription state to the expert's record.
// opts.status overrides sub.status (used for webhook event types). opts.expertId skips the lookup.
export async function applySubscription(sub, opts = {}) {
  const expertId = opts.expertId ?? (await findExpertId(sub));
  if (!expertId) return { ok: false, reason: "no-expert" };

  const status = String(opts.status ?? sub.status ?? "").toLowerCase();
  const data = {
    dodoSubscriptionId: sub.subscription_id,
    ...(sub.customer?.customer_id ? { dodoCustomerId: sub.customer.customer_id } : {}),
  };

  if (status === "active") {
    let until = sub.next_billing_date ? new Date(sub.next_billing_date) : null;
    if (!until || Number.isNaN(until.getTime()) || until <= new Date()) until = new Date(Date.now() + 32 * DAY);
    data.blueTickUntil = until;
    data.dodoStatus = sub.cancel_at_next_billing_date ? "CANCELLING" : "ACTIVE";
  } else if (status === "on_hold") {
    data.dodoStatus = "ON_HOLD";
  } else if (status === "cancelled") {
    data.dodoStatus = "CANCELLED"; // tick stays until blueTickUntil
  } else if (status === "expired" || status === "failed") {
    data.dodoStatus = "EXPIRED";
    data.blueTickUntil = new Date();
  } else {
    return { ok: true, ignored: true };
  }

  await prisma.expertProfile.update({ where: { id: expertId }, data });
  return { ok: true };
}


// Saves a succeeded Dodo payment. Works for subscription and one-time products.
export async function applyPayment(payment, opts = {}) {
  if (String(payment.status).toLowerCase() !== "succeeded") return { ok: false, reason: "not-succeeded" };

  const productId = process.env.DODO_VERIFY_PRODUCT_ID;
  const cart = payment.product_cart;
  if (productId && Array.isArray(cart) && cart.length && !cart.some((c) => c.product_id === productId)) {
    return { ok: false, reason: "other-product" };
  }

  const expertId = opts.expertId ?? (await findExpertId(payment));
  if (!expertId) return { ok: false, reason: "no-expert" };

  // Subscription product: read the subscription and use its next billing date.
  if (payment.subscription_id) {
    const sub = await dodo.subscriptions.retrieve(payment.subscription_id);
    return applySubscription(
      { ...sub, metadata: { ...(payment.metadata ?? {}), ...(sub.metadata ?? {}) } },
      { expertId, status: sub.status }
    );
  }

  // One-time product: add 30 days, once per payment id.
  try {
    await prisma.blueTickPayment.create({ data: { paymentId: payment.payment_id, expertId } });
  } catch (e) {
    if (e.code === "P2002") return { ok: true, duplicate: true };
    throw e;
  }
  const expert = await prisma.expertProfile.findUnique({ where: { id: expertId }, select: { blueTickUntil: true } });
  const base = expert?.blueTickUntil && expert.blueTickUntil > new Date() ? expert.blueTickUntil : new Date();
  await prisma.expertProfile.update({
    where: { id: expertId },
    data: { blueTickUntil: new Date(base.getTime() + 30 * DAY), dodoStatus: "ONE_TIME" },
  });
  return { ok: true };
}