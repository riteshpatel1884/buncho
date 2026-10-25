import crypto from 'node:crypto';
import { prisma } from './prisma';
import { addMonths } from './pricing';

/**
 * Cashfree Payment Gateway over REST (no extra dependency).
 * Env: CASHFREE_APP_ID, CASHFREE_SECRET_KEY, CASHFREE_ENV ("production" | "sandbox"), NEXT_PUBLIC_APP_URL
 * Optional: CASHFREE_DEFAULT_PHONE (10 digits). Cashfree needs a phone on every order, and we no longer ask the buyer.
 */
export const CASHFREE_MODE = process.env.CASHFREE_ENV === 'production' ? 'production' : 'sandbox';
const BASE = CASHFREE_MODE === 'production' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';
const API_VERSION = '2023-08-01';

export const appUrl = () => (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

function credentials() {
  const id = process.env.CASHFREE_APP_ID;
  const secret = process.env.CASHFREE_SECRET_KEY;
  if (!id || !secret) throw new Error('Cashfree is not configured. Set CASHFREE_APP_ID and CASHFREE_SECRET_KEY.');
  return { id, secret };
}

async function cashfree(path, init = {}) {
  const { id, secret } = credentials();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', 'x-client-id': id, 'x-client-secret': secret, 'x-api-version': API_VERSION },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('[cashfree] request failed', path, res.status, body);
    throw new Error(body?.message || 'The payment provider returned an error.');
  }
  return body;
}

const fallbackPhone = () => {
  const p = String(process.env.CASHFREE_DEFAULT_PHONE ?? '').replace(/\D/g, '').slice(-10);
  return /^[6-9]\d{9}$/.test(p) ? p : '9999999999';
};

export function createCashfreeOrder({ orderId, amountPaise, customerId, phone, email, name, note }) {
  const base = appUrl();
  const https = base.startsWith('https://');
  return cashfree('/orders', {
    method: 'POST',
    body: JSON.stringify({
      order_id: orderId,
      order_amount: Number((amountPaise / 100).toFixed(2)),
      order_currency: 'INR',
      order_note: note,
      customer_details: {
        customer_id: customerId,
        customer_phone: phone || fallbackPhone(),
        ...(email && { customer_email: email }),
        ...(name && { customer_name: name.slice(0, 100) }),
      },
      order_meta: {
        // Cashfree swaps {order_id} in. Webhook URLs must be https, so skip it for plain-http local development.
        return_url: `${base}/billing/return?order_id={order_id}`,
        ...(https && { notify_url: `${base}/api/billing/webhook` }),
      },
    }),
  });
}

export const fetchCashfreeOrder = (orderId) => cashfree(`/orders/${encodeURIComponent(orderId)}`);

/** Cashfree signs webhooks as base64(HMAC-SHA256(timestamp + rawBody, secret)). */
export function verifyWebhookSignature(rawBody, signature, timestamp) {
  if (!signature || !timestamp) return false;
  const { secret } = credentials();
  const expected = crypto.createHmac('sha256', secret).update(timestamp + rawBody).digest('base64');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Marks the payment paid and extends Pro. Only the call that flips it to PAID extends the subscription.
 * The length comes from the payment row (months + bonus days), so later price changes never affect it.
 */
async function grantPro(orderId, cfPaymentId) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { orderId } });
    if (!payment) return { ok: false };

    const claimed = await tx.payment.updateMany({
      where: { orderId, status: { not: 'PAID' } },
      data: { status: 'PAID', paidAt: new Date(), ...(cfPaymentId && { cfPaymentId: String(cfPaymentId) }) },
    });
    if (claimed.count === 0) return { ok: true, already: true };

    const now = new Date();
    const sub = await tx.subscription.findUnique({ where: { userId: payment.userId } });
    const from = sub && sub.currentPeriodEnd > now ? sub.currentPeriodEnd : now; // paying early adds time on top
    const end = new Date(addMonths(from, payment.periodMonths || 1).getTime() + (payment.bonusDays || 0) * 86400000);
    await tx.subscription.upsert({
      where: { userId: payment.userId },
      update: { currentPeriodEnd: end, plan: payment.plan },
      create: { userId: payment.userId, plan: payment.plan, currentPeriodEnd: end },
    });

    if (payment.discountCode) {
      await tx.discountCode.updateMany({ where: { code: payment.discountCode }, data: { redeemedCount: { increment: 1 } } });
    }
    return { ok: true };
  });
}

/** Asks Cashfree what happened to this order, then updates our records. Returns 'paid' | 'pending' | 'failed' | 'unknown'. */
export async function verifyAndSettle(orderId, cfPaymentId = null) {
  const payment = await prisma.payment.findUnique({ where: { orderId } });
  if (!payment) return 'unknown';
  if (payment.status === 'PAID') return 'paid';

  const order = await fetchCashfreeOrder(orderId);

  if (order.order_status === 'PAID') {
    const amountOk = Math.round(Number(order.order_amount) * 100) === payment.amountPaise && order.order_currency === payment.currency;
    if (!amountOk) {
      console.error('[billing] amount mismatch', orderId, order.order_amount, order.order_currency);
      return 'failed';
    }
    const res = await grantPro(orderId, cfPaymentId);
    return res.ok ? 'paid' : 'unknown';
  }

  if (order.order_status === 'EXPIRED' || order.order_status === 'TERMINATED' || order.order_status === 'TERMINATION_REQUESTED') {
    await prisma.payment.updateMany({ where: { orderId, status: 'PENDING' }, data: { status: 'FAILED' } });
    return 'failed';
  }
  return 'pending';
}