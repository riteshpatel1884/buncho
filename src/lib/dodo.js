import crypto from 'node:crypto';

/**
 * Dodo Payments over REST (no extra dependency). Used for sponsor banners and for Pro payments in other currencies.
 * Env: DODO_PAYMENTS_API_KEY, DODO_PAYMENTS_ENV ("live_mode" | "test_mode"), DODO_PAYMENTS_WEBHOOK_SECRET,
 *      DODO_AD_PRODUCT_ID  (one-time USD product with "Pay What You Want" on, for banners),
 *      DODO_PRO_PRODUCT_ID (same kind of product, named "Buncho Pro", for Pro payments),
 *      NEXT_PUBLIC_APP_URL
 */
export const DODO_MODE = process.env.DODO_PAYMENTS_ENV === 'live_mode' ? 'live_mode' : 'test_mode';
const BASE = DODO_MODE === 'live_mode' ? 'https://live.dodopayments.com' : 'https://test.dodopayments.com';

export const appUrl = () => (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

/** The Pro product. Falls back to the banner product if you have not made a separate one yet. */
export const proProductId = () => process.env.DODO_PRO_PRODUCT_ID || process.env.DODO_AD_PRODUCT_ID || '';

/** True when paying in other currencies can work (shown to the buyer as available or not). */
export const dodoConfigured = () => Boolean(process.env.DODO_PAYMENTS_API_KEY && proProductId());

function apiKey() {
  const key = process.env.DODO_PAYMENTS_API_KEY;
  if (!key) throw new Error('Dodo Payments is not configured. Set DODO_PAYMENTS_API_KEY.');
  return key;
}

async function dodo(path, init = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey()}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('[dodo] request failed', path, res.status, body);
    throw new Error(body?.message || 'The payment provider returned an error.');
  }
  return body;
}

/**
 * Creates a hosted checkout. The amount is sent per session (Pay What You Want product),
 * in the lowest currency unit (cents). Returns { session_id, checkout_url }.
 * productId defaults to the banner product, so the sponsor flow keeps working unchanged.
 */
export async function createDodoCheckout({ orderId, amountCents, email, name, returnUrl, metadata, productId }) {
  const product = productId || process.env.DODO_AD_PRODUCT_ID;
  if (!product) throw new Error('Set DODO_AD_PRODUCT_ID or DODO_PRO_PRODUCT_ID to the id of your Pay What You Want product.');

  const body = await dodo('/checkouts', {
    method: 'POST',
    body: JSON.stringify({
      product_cart: [{ product_id: product, quantity: 1, amount: amountCents }],
      ...(email && { customer: { email, ...(name && { name: String(name).slice(0, 100) }) } }),
      return_url: returnUrl,
      metadata: { order_id: orderId, ...metadata },
    }),
  });
  if (!body.checkout_url) throw new Error('No checkout link returned.');
  return body;
}

export const getDodoPayment = (paymentId) => dodo(`/payments/${encodeURIComponent(paymentId)}`);

/**
 * Dodo follows the Standard Webhooks spec: signature = base64(HMAC-SHA256(`${id}.${timestamp}.${rawBody}`)),
 * sent as "v1,<signature>" (possibly several, separated by spaces). The secret looks like "whsec_<base64>".
 */
export function verifyDodoWebhook(rawBody, headers) {
  const id = headers.get('webhook-id');
  const timestamp = headers.get('webhook-timestamp');
  const signature = headers.get('webhook-signature');
  if (!id || !timestamp || !signature) return false;

  const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
  if (!secret) throw new Error('Set DODO_PAYMENTS_WEBHOOK_SECRET.');

  // Reject old or replayed deliveries (5 minute window)
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const keys = [];
  const raw = secret.startsWith('whsec_') ? secret.slice(6) : secret;
  keys.push(Buffer.from(raw, 'base64'));
  keys.push(Buffer.from(secret, 'utf8'));

  const given = signature
    .split(' ')
    .map((part) => part.split(','))
    .filter(([version, sig]) => version === 'v1' && sig)
    .map(([, sig]) => Buffer.from(sig));

  return keys.some((key) => {
    const expected = Buffer.from(crypto.createHmac('sha256', key).update(`${id}.${timestamp}.${rawBody}`).digest('base64'));
    return given.some((g) => g.length === expected.length && crypto.timingSafeEqual(g, expected));
  });
}