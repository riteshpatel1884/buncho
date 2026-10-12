import crypto from "crypto";

const PROD = String(process.env.CASHFREE_ENVIRONMENT || "sandbox").toLowerCase() === "production";
const API = PROD ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
const CHECKOUT = PROD ? "https://payments.cashfree.com/order/#" : "https://payments-test.cashfree.com/order/#";
const VERSION = "2023-08-01";

async function request(path, { method = "GET", body } = {}) {
  const id = process.env.CASHFREE_APP_ID;
  const secret = process.env.CASHFREE_SECRET_KEY;
  if (!id || !secret) throw new Error("CASHFREE_APP_ID / CASHFREE_SECRET_KEY are not set");

  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "x-client-id": id,
      "x-client-secret": secret,
      "x-api-version": VERSION,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {}

  if (!res.ok) {
    const err = new Error(`Cashfree ${res.status} ${data?.code ?? ""}: ${data?.message ?? text}`.trim());
    err.status = res.status;
    err.code = data?.code;
    throw err;
  }
  return data;
}

// Order ids look like "bk_<bookingId>_<time>". The prefix says what the payment is for:
// bk = session booking, pj = project proposal, be = expert blue tick, bu = student blue tick.
// The time part lets the same item be paid again if the first checkout was abandoned.
export function newOrderId(prefix, id) {
  return `${prefix}_${id}_${Date.now().toString(36)}`;
}

export function parseOrderId(orderId) {
  const m = /^([a-z]{2})_([A-Za-z0-9]+)_([a-z0-9]+)$/.exec(String(orderId || ""));
  return m ? { prefix: m[1], id: m[2] } : null;
}

// Creates an order and returns the Cashfree hosted checkout URL.
// The amount always comes from the caller (the database), never from the browser.
export async function createCheckout({ orderId, amountInr, user, returnUrl, note, expiryMinutes = 30 }) {
  if (!Number.isSafeInteger(amountInr) || amountInr < 1) throw new Error("Invalid amount");

  const order = await request("/orders", {
    method: "POST",
    body: {
      order_id: orderId,
      order_amount: amountInr,
      order_currency: "INR",
      customer_details: {
        customer_id: String(user.id),
        customer_email: user.email,
        // Cashfree requires a phone number. We don't collect one, so a placeholder is sent.
        customer_phone: "9999999999",
        ...(user.name ? { customer_name: String(user.name).slice(0, 100) } : {}),
      },
      order_meta: { return_url: returnUrl }, // {order_id} in the URL is filled in by Cashfree
      order_note: note ? String(note).slice(0, 200) : undefined,
      order_expiry_time: new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString(),
    },
  });

  if (!order?.payment_session_id) throw new Error("Cashfree did not return a payment session");
  return `${CHECKOUT}${order.payment_session_id}`;
}

// Asks Cashfree directly whether an order is paid. Never trust the browser or a webhook body alone.
// Returns null if it is not paid (yet).
export async function getPaidOrder(orderId) {
  const enc = encodeURIComponent(orderId);
  const order = await request(`/orders/${enc}`);
  if (order?.order_status !== "PAID") return null;

  const payments = await request(`/orders/${enc}/payments`);
  const ok = Array.isArray(payments) ? payments.find((p) => p.payment_status === "SUCCESS") : null;
  if (!ok) return null;

  return {
    orderId: order.order_id,
    amountInr: Number(order.order_amount),
    currency: String(order.order_currency || "").toUpperCase(),
    cfPaymentId: String(ok.cf_payment_id),
  };
}

// Refunds the full amount of a paid order.
export async function refundOrder(orderId, note) {
  const enc = encodeURIComponent(orderId);
  const order = await request(`/orders/${enc}`);
  if (order?.order_status !== "PAID") throw new Error("Order is not paid, nothing to refund");

  try {
    return await request(`/orders/${enc}/refunds`, {
      method: "POST",
      body: {
        refund_amount: Number(order.order_amount),
        refund_id: `rf_${orderId}`.slice(0, 40), // same id every time, so a retry can't refund twice
        refund_note: String(note || "Refund").slice(0, 100),
      },
    });
  } catch (e) {
    // If an earlier call already created the refund, that counts as done.
    const list = await request(`/orders/${enc}/refunds`).catch(() => []);
    const live = Array.isArray(list) ? list.find((r) => r.refund_status !== "CANCELLED" && r.refund_status !== "FAILED") : null;
    if (live) return live;
    throw e;
  }
}

// Cashfree signs webhooks: base64(HMAC-SHA256(timestamp + rawBody, secretKey)).
export function verifyWebhook(rawBody, signature, timestamp) {
  const secret = process.env.CASHFREE_SECRET_KEY;
  if (!secret || !signature || !timestamp) return false;
  const expected = crypto.createHmac("sha256", secret).update(timestamp + rawBody).digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}