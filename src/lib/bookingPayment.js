import { prisma } from "@/lib/prisma";
import { createCheckout, newOrderId, parseOrderId, refundOrder } from "@/lib/cashfree";
import { emailAdmin } from "@/lib/email";
import { findContactInfo } from "@/lib/contactCheck";

// An unpaid request stays visible to the student for 20 minutes while the payment can still go through.
export const HOLD_MINUTES = 20;

// Creates a Cashfree order using the price saved on the booking and returns the checkout URL.
export async function createBookingCheckout({ booking, user }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL is not set");

  // Never take the checkout amount from client input.
  if (!Number.isSafeInteger(booking.priceInr) || booking.priceInr < 1 || booking.priceInr > 100000) {
    throw new Error("Invalid booking price");
  }
  if (booking.paymentStatus !== "UNPAID") throw new Error("Booking is not awaiting payment");

  return createCheckout({
    orderId: newOrderId("bk", booking.id),
    amountInr: booking.priceInr,
    user,
    returnUrl: `${appUrl}/dashboard?booked=1&order_id={order_id}`,
    note: "Buncho session booking",
    expiryMinutes: 30,
  });
}

// Refund a paid booking that was declined or cancelled.
export async function refundBooking(booking) {
  if (booking.paymentStatus !== "PAID" || !booking.cashfreeOrderId) return;

  try {
    await refundOrder(booking.cashfreeOrderId, "Booking declined or cancelled");
    await prisma.booking.update({ where: { id: booking.id }, data: { paymentStatus: "REFUNDED" } });
  } catch (e) {
    console.error("[booking refund] failed:", booking.id, e?.message);
    await prisma.booking.update({ where: { id: booking.id }, data: { paymentStatus: "REFUND_FAILED" } });
  }
}

// Apply a verified Cashfree payment ("paid" comes from getPaidOrder) to its booking.
// Repeated webhook deliveries won't process the payment twice.
// The expert is NOT told yet: the request waits in the admin Inbox first.
export async function applyBookingPayment(paid, opts = {}) {
  if (paid.currency !== "INR") return { ok: false, reason: "wrong-currency" };

  const parsed = parseOrderId(paid.orderId);
  if (!parsed || parsed.prefix !== "bk") return { ok: false, reason: "not-booking" };

  const booking = await prisma.booking.findUnique({
    where: { id: parsed.id },
    include: {
      student: { select: { name: true } },
      service: { select: { title: true } },
    },
  });
  if (!booking) return { ok: false, reason: "no-booking" };
  if (opts.studentId && booking.studentId !== opts.studentId) return { ok: false, reason: "not-yours" };
  if (booking.paymentStatus !== "UNPAID") return { ok: true, duplicate: true };

  if (paid.amountInr !== booking.priceInr) {
    console.error("[booking payment] amount mismatch", { booking: booking.id, expected: booking.priceInr, paid: paid.amountInr, orderId: paid.orderId });
    await emailAdmin({
      subject: "Booking payment needs a manual check",
      lines: [`Order ${paid.orderId} was paid ₹${paid.amountInr} but the booking price is ₹${booking.priceInr}.`, "The booking was NOT marked as paid."],
    });
    return { ok: false, reason: "amount-mismatch" };
  }

  const dead = booking.status !== "PENDING";
  const flags = findContactInfo(booking.note);

  // Only one concurrent caller can win this update.
  const won = await prisma.booking.updateMany({
    where: { id: booking.id, paymentStatus: "UNPAID" },
    data: {
      paymentStatus: "PAID",
      cashfreeOrderId: paid.orderId,
      paidAt: new Date(),
      noteFlags: flags,
    },
  });
  if (won.count === 0) return { ok: true, duplicate: true };

  // Paid after the request was already cancelled: give the money back.
  if (dead) {
    await refundBooking({ id: booking.id, paymentStatus: "PAID", cashfreeOrderId: paid.orderId });
    return { ok: true, refunded: true };
  }

  await emailAdmin({
    subject: "New request to approve",
    lines: [
      `${booking.student.name || "A student"} paid ₹${booking.priceInr} for ${booking.service.title}.`,
      ...(flags.length ? [`Possible contact info in the message: ${flags.join(", ")}.`] : []),
      "Read it before the expert sees it.",
    ],
  });
  return { ok: true };
}