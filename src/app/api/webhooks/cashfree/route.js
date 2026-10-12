import { verifyWebhook, getPaidOrder, parseOrderId } from "@/lib/cashfree";
import { applyPayment } from "@/lib/blueTick";
import { applyBookingPayment } from "@/lib/bookingPayment";
import { applyProjectPayment } from "@/lib/projectPayment";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const body = await req.text();

  if (!verifyWebhook(body, req.headers.get("x-webhook-signature"), req.headers.get("x-webhook-timestamp"))) {
    console.error("[cashfree webhook] signature check failed");
    return new Response("Invalid signature", { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return new Response("Bad body", { status: 400 });
  }

  if (event.type !== "PAYMENT_SUCCESS_WEBHOOK") return new Response("ok");

  const orderId = event.data?.order?.order_id;
  const parsed = parseOrderId(orderId);
  if (!parsed) return new Response("ignored"); // an order that is not ours
  console.log("[cashfree webhook] received", event.type, orderId);

  try {
    // Do not trust the webhook body for money: ask Cashfree if the order is really paid.
    const paid = await getPaidOrder(orderId);
    if (!paid) {
      console.error("[cashfree webhook] order not paid yet", orderId);
      return new Response("Not paid yet", { status: 500 }); // Cashfree retries
    }

    let res;
    if (parsed.prefix === "bk") res = await applyBookingPayment(paid);
    else if (parsed.prefix === "pj") res = await applyProjectPayment(paid);
    else if (parsed.prefix === "be" || parsed.prefix === "bu") res = await applyPayment(paid);
    else return new Response("ignored");

    if (!res.ok) console.error("[cashfree webhook] payment not applied", { reason: res.reason, orderId });
    return new Response("ok");
  } catch (e) {
    console.error("[cashfree webhook] error:", e);
    return new Response("Error", { status: 500 }); // Cashfree retries
  }
}