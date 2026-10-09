import { dodo } from "@/lib/dodo";
import { applySubscription, applyPayment } from "@/lib/blueTick";
import { applyBookingPayment } from "@/lib/bookingPayment";

export const dynamic = "force-dynamic";

const STATUS = {
  "subscription.active": "active",
  "subscription.renewed": "active",
  "subscription.on_hold": "on_hold",
  "subscription.cancelled": "cancelled",
  "subscription.expired": "expired",
  "subscription.failed": "failed",
};

export async function POST(req) {
  const body = await req.text();
  let event;
  try {
    event = dodo.webhooks.unwrap(body, {
      headers: {
        "webhook-id": req.headers.get("webhook-id") ?? "",
        "webhook-signature": req.headers.get("webhook-signature") ?? "",
        "webhook-timestamp": req.headers.get("webhook-timestamp") ?? "",
      },
    });
  } catch (e) {
    console.error("[dodo webhook] signature check failed:", e?.message);
    return new Response("Invalid signature", { status: 400 });
  }

  const d = event.data ?? {};
  console.log("[dodo webhook] received", event.type, d.subscription_id ?? d.payment_id);

  // Session bookings: payments created by createBookingCheckout carry metadata.type = "booking".
  if (d.metadata?.type === "booking") {
    if (event.type !== "payment.succeeded") return new Response("ok");
    try {
      const res = await applyBookingPayment(d);
      if (!res.ok) console.error("[dodo webhook] booking payment not applied", { reason: res.reason, payment_id: d.payment_id, metadata: d.metadata });
      return new Response("ok");
    } catch (e) {
      console.error("[dodo webhook] booking payment error:", e);
      return new Response("Error", { status: 500 }); // Dodo retries
    }
  }

  // Ignore events for other products on the same Dodo account.
  const productId = process.env.DODO_VERIFY_PRODUCT_ID;
  if (d.product_id && productId && d.product_id !== productId) return new Response("ignored");

  // Blue tick: one-time and first subscription payments. applyPayment also checks the product in the cart.
  if (event.type === "payment.succeeded") {
    try {
      const res = await applyPayment(d);
      if (!res.ok && res.reason !== "other-product" && res.reason !== "not-succeeded") {
        console.error("[dodo webhook] payment not applied", {
          reason: res.reason,
          payment_id: d.payment_id,
          metadata: d.metadata,
          email: d.customer?.email,
        });
        return new Response("Not applied", { status: 500 }); // Dodo retries
      }
      return new Response("ok");
    } catch (e) {
      console.error("[dodo webhook] payment error:", e);
      return new Response("Error", { status: 500 });
    }
  }

  // Subscription lifecycle events.
  const status = STATUS[event.type];
  if (!status) return new Response("ok");

  try {
    const res = await applySubscription(d, { status });
    if (!res.ok) {
      console.error("[dodo webhook] no expert matched", {
        type: event.type,
        subscription_id: d.subscription_id,
        metadata: d.metadata,
        email: d.customer?.email,
      });
      return new Response("No matching expert", { status: 500 }); // shows as failed in Dodo, and Dodo retries
    }
    return new Response("ok");
  } catch (e) {
    console.error("[dodo webhook] handler error:", e);
    return new Response("Error", { status: 500 });
  }
}