import { prisma } from "@/lib/prisma";
import { dodo } from "@/lib/dodo";

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
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const d = event.data ?? {};
  const where = d.metadata?.expertId ? { id: d.metadata.expertId } : { dodoSubscriptionId: d.subscription_id };
  if (!d.metadata?.expertId && !d.subscription_id) return new Response("ok");

  try {
    switch (event.type) {
      case "subscription.active":
      case "subscription.renewed": {
        let until = d.next_billing_date ? new Date(d.next_billing_date) : null;
        if (!until || Number.isNaN(until.getTime()) || until <= new Date()) {
          until = new Date(Date.now() + 32 * 24 * 60 * 60 * 1000);
        }
        await prisma.expertProfile.updateMany({
          where,
          data: {
            blueTickUntil: until,
            dodoSubscriptionId: d.subscription_id,
            dodoCustomerId: d.customer?.customer_id ?? null,
            dodoStatus: "ACTIVE",
          },
        });
        break;
      }
      case "subscription.on_hold":
        await prisma.expertProfile.updateMany({ where, data: { dodoStatus: "ON_HOLD" } });
        break;
      case "subscription.cancelled":
        await prisma.expertProfile.updateMany({ where, data: { dodoStatus: "CANCELLED" } });
        break;
      case "subscription.expired":
      case "subscription.failed":
        await prisma.expertProfile.updateMany({ where, data: { dodoStatus: "EXPIRED", blueTickUntil: new Date() } });
        break;
    }
  } catch (e) {
    console.error("Dodo webhook error", e);
    return new Response("Error", { status: 500 }); // Dodo retries
  }
  return new Response("ok");
}