import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhook } from "@/lib/dodo";

// Dodo Payments calls this when a payment finishes. This is the ONLY place verification is granted:
// the page the customer returns to is never trusted.
export async function POST(req) {
  const raw = await req.text();

  let valid = false;
  try {
    valid = verifyWebhook(raw, req.headers);
  } catch (e) {
    console.error("Dodo webhook config error:", e.message);
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }
  if (!valid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  const event = JSON.parse(raw);
  const data = event.data ?? {};
  const paymentId = data.metadata?.paymentId;

  if (event.type === "payment.succeeded" && paymentId) {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (payment && payment.status !== "PAID") {
      const now = new Date();
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: { status: "PAID", paidAt: now, providerId: data.payment_id ?? null },
        }),
        prisma.product.update({ where: { id: payment.productId }, data: { verified: true, verifiedAt: now } }),
        prisma.user.update({ where: { id: payment.userId }, data: { verified: true, verifiedAt: now } }),
      ]);
    }
  } else if ((event.type === "payment.failed" || event.type === "payment.cancelled") && paymentId) {
    await prisma.payment.updateMany({ where: { id: paymentId, status: "PENDING" }, data: { status: "FAILED" } });
  }

  return NextResponse.json({ received: true });
}