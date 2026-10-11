import { prisma } from "@/lib/prisma";
import { dodo } from "@/lib/dodo";
import { emailNewRequest } from "@/lib/email";
import { emailAdmin } from "@/lib/email";
import { findContactInfo } from "@/lib/contactCheck";

// An unpaid request stays visible to the student for 20 minutes while the payment can still go through.
export const HOLD_MINUTES = 20;

// Create a Dodo Checkout Session using the price saved on the booking.
// Dodo product must be a one-time INR product with "Pay what you want" enabled.
export async function createBookingCheckout({ booking, user }) {
  const productId = process.env.DODO_SESSION_PRODUCT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!productId) throw new Error("DODO_SESSION_PRODUCT_ID is not set");
  if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL is not set");

  // Never take the checkout amount from client input.
  if (!Number.isSafeInteger(booking.priceInr) || booking.priceInr < 1 || booking.priceInr > 100000) {
    throw new Error("Invalid booking price");
  }
  if (booking.paymentStatus !== "UNPAID") throw new Error("Booking is not awaiting payment");

  const session = await dodo.checkoutSessions.create({
    product_cart: [
      {
        product_id: productId,
        quantity: 1,
        // ₹1 = 100 paise. Requires an INR product with custom amounts.
        amount: booking.priceInr * 100,
      },
    ],
    customer: {
      email: user.email,
      ...(user.name ? { name: user.name } : {}),
    },
    metadata: { type: "booking", bookingId: booking.id },
    return_url: `${appUrl}/dashboard?booked=1`,
  });

  if (!session.checkout_url) throw new Error("Dodo did not return a checkout URL");
  return session.checkout_url;
}

// Refund a paid booking that was declined or cancelled.
export async function refundBooking(booking) {
  if (booking.paymentStatus !== "PAID" || !booking.dodoPaymentId) return;

  try {
    await dodo.refunds.create({
      payment_id: booking.dodoPaymentId,
      reason: "Booking declined or cancelled",
    });
    await prisma.booking.update({ where: { id: booking.id }, data: { paymentStatus: "REFUNDED" } });
  } catch (e) {
    console.error("[booking refund] failed:", booking.id, e?.message);
    await prisma.booking.update({ where: { id: booking.id }, data: { paymentStatus: "REFUND_FAILED" } });
  }
}

// Apply a successful Dodo payment to its booking.
// Repeated webhook deliveries won't process the payment twice.
// The expert is NOT told yet: the request waits in the admin Inbox first.
export async function applyBookingPayment(payment, opts = {}) {
  if (String(payment.status).toLowerCase() !== "succeeded") return { ok: false, reason: "not-succeeded" };
  if (String(payment.currency).toUpperCase() !== "INR") return { ok: false, reason: "wrong-currency" };

  const bookingId = payment.metadata?.bookingId;
  if (payment.metadata?.type !== "booking" || !bookingId) return { ok: false, reason: "not-booking" };
  if (!payment.payment_id) return { ok: false, reason: "missing-payment-id" };

  const booking = await prisma.booking.findUnique({
    where: { id: String(bookingId) },
    include: {
      student: { select: { name: true } },
      service: { select: { title: true } },
    },
  });
  if (!booking) return { ok: false, reason: "no-booking" };
  if (opts.studentId && booking.studentId !== opts.studentId) return { ok: false, reason: "not-yours" };
  if (booking.paymentStatus !== "UNPAID") return { ok: true, duplicate: true };

  // IMPORTANT: this does not yet check that the amount paid matches booking.priceInr.
  // The Dodo product is "pay what you want", so a buyer can change the amount at checkout.
  // Log the real payment payload, then compare the paid amount before marking PAID.

  const dead = booking.status !== "PENDING";
  const flags = findContactInfo(booking.note);

  // Only one concurrent caller can win this update.
  const won = await prisma.booking.updateMany({
    where: { id: booking.id, paymentStatus: "UNPAID" },
    data: {
      paymentStatus: "PAID",
      dodoPaymentId: payment.payment_id,
      paidAt: new Date(),
      noteFlags: flags,
    },
  });
  if (won.count === 0) return { ok: true, duplicate: true };

  // Paid after the request was already cancelled: give the money back.
  if (dead) {
    await refundBooking({ id: booking.id, paymentStatus: "PAID", dodoPaymentId: payment.payment_id });
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