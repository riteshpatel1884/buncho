import crypto from "node:crypto";

const BASE = {
  test_mode: "https://test.dodopayments.com",
  live_mode: "https://live.dodopayments.com",
};

export const VERIFY_PRICE_INR = 49;

// Creates a hosted Dodo checkout for the ₹49 verification product.
export async function createVerificationCheckout({ paymentId, productId, userId, email, name, returnUrl }) {
  const key = process.env.DODO_PAYMENTS_API_KEY;
  const productRef = process.env.DODO_VERIFY_PRODUCT_ID;
  if (!key || !productRef) throw new Error("Dodo Payments is not configured (DODO_PAYMENTS_API_KEY, DODO_VERIFY_PRODUCT_ID).");

  const base = BASE[process.env.DODO_PAYMENTS_ENVIRONMENT] ?? BASE.test_mode;
  const res = await fetch(`${base}/checkouts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      product_cart: [{ product_id: productRef, quantity: 1 }],
      ...(email && !email.endsWith("@no-email.local") ? { customer: { email, name: name || undefined } } : {}),
      return_url: returnUrl,
      metadata: { paymentId, productId, userId },
    }),
  });
  if (!res.ok) throw new Error(`Dodo checkout failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
  return res.json(); // { session_id, checkout_url }
}

// Standard Webhooks signature check (https://standardwebhooks.com), as used by Dodo Payments.
export function verifyWebhook(rawBody, headers) {
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
  if (!secret) throw new Error("DODO_PAYMENTS_WEBHOOK_KEY is not set");

  const id = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp");
  const signatures = headers.get("webhook-signature");
  if (!id || !timestamp || !signatures) return false;

  // reject anything older or newer than 5 minutes (replay protection)
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const key = Buffer.from(secret.startsWith("whsec_") ? secret.slice(6) : secret, "base64");
  const expected = crypto.createHmac("sha256", key).update(`${id}.${timestamp}.${rawBody}`).digest("base64");
  const expectedBuf = Buffer.from(expected);

  return signatures.split(" ").some((part) => {
    const [version, sig] = part.split(",");
    if (version !== "v1" || !sig) return false;
    const sigBuf = Buffer.from(sig);
    return sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf);
  });
}