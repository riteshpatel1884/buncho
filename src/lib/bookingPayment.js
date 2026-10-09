
import { prisma } from "@/lib/prisma";
import { dodo } from "@/lib/dodo";
import { emailNewRequest } from "@/lib/email";

// An unpaid booking holds its slot for 20 minutes.
export const HOLD_MINUTES = 20;

// Booking statuses that block a time slot.
export function activeHold() {
  const cutoff = new Date(Date.now() - HOLD_MINUTES * 60000);

  return {
    status: { in: ["PENDING", "CONFIRMED"] },
    OR: [
      { paymentStatus: { not: "UNPAID" } },
      { createdAt: { gte: cutoff } },
    ],
  };
}

// Create a Dodo Checkout Session using the price saved on the booking.
// Dodo product must be a one-time INR product with
// "Pay what you want" enabled.
export async function createBookingCheckout({ booking, user }) {
  const productId = process.env.DODO_SESSION_PRODUCT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!productId) {
    throw new Error("DODO_SESSION_PRODUCT_ID is not set");
  }

  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is not set");
  }

  // Never take the checkout amount from client input.
  if (
    !Number.isSafeInteger(booking.priceInr) ||
    booking.priceInr < 1 ||
    booking.priceInr > 100000
  ) {
    throw new Error("Invalid booking price");
  }

  if (booking.paymentStatus !== "UNPAID") {
    throw new Error("Booking is not awaiting payment");
  }

  const session = await dodo.checkoutSessions.create({
    product_cart: [
      {
        product_id: productId,
        quantity: 1,
        // ₹1 = 100 paise. This requires the product currency
        // to be INR and custom amounts to be supported.
        amount: booking.priceInr * 100,
      },
    ],
    customer: {
      email: user.email,
      ...(user.name ? { name: user.name } : {}),
    },
    metadata: {
      type: "booking",
      bookingId: booking.id,
    },
    return_url: `${appUrl}/dashboard?booked=1`,
  });

  if (!session.checkout_url) {
    throw new Error("Dodo did not return a checkout URL");
  }

  return session.checkout_url;
}

// Refund a paid booking that was declined or cancelled.
export async function refundBooking(booking) {
  if (
    booking.paymentStatus !== "PAID" ||
    !booking.dodoPaymentId
  ) {
    return;
  }

  try {
    await dodo.refunds.create({
      payment_id: booking.dodoPaymentId,
      reason: "Booking declined or cancelled",
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentStatus: "REFUNDED" },
    });
  } catch (e) {
    console.error(
      "[booking refund] failed:",
      booking.id,
      e?.message
    );

    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentStatus: "REFUND_FAILED" },
    });
  }
}

// Apply a successful Dodo payment to its booking.
// Repeated webhook deliveries won't process the payment twice.
export async function applyBookingPayment(payment, opts = {}) {
  if (String(payment.status).toLowerCase() !== "succeeded") {
    return { ok: false, reason: "not-succeeded" };
  }

  if (String(payment.currency).toUpperCase() !== "INR") {
    return { ok: false, reason: "wrong-currency" };
  }

  const bookingId = payment.metadata?.bookingId;

  if (payment.metadata?.type !== "booking" || !bookingId) {
    return { ok: false, reason: "not-booking" };
  }

  if (!payment.payment_id) {
    return { ok: false, reason: "missing-payment-id" };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: String(bookingId) },
    include: {
      expert: {
        select: {
          user: { select: { email: true } },
        },
      },
      student: {
        select: { name: true },
      },
      service: {
        select: { title: true },
      },
    },
  });

  if (!booking) {
    return { ok: false, reason: "no-booking" };
  }

  if (opts.studentId && booking.studentId !== opts.studentId) {
    return { ok: false, reason: "not-yours" };
  }

  if (booking.paymentStatus !== "UNPAID") {
    return { ok: true, duplicate: true };
  }

  // IMPORTANT:
  // Confirm the exact payment amount against the booking price
  // using the verified Dodo webhook's documented amount field
  // before marking this booking PAID.
  //
  // Dodo payload amount fields may vary by event/API version.
  // Do not assume a field or ignore taxes without verifying
  // the actual payment payload in test mode.

  const dead = booking.status !== "PENDING";

  const clash = dead
    ? null
    : await prisma.booking.findFirst({
        where: {
          id: { not: booking.id },
          expertId: booking.expertId,
          startsAt: { lt: booking.endsAt },
          endsAt: { gt: booking.startsAt },
          paymentStatus: { not: "UNPAID" },
          ...activeHold(),
        },
        select: { id: true },
      });

  // Only one concurrent caller can win this update.
  const won = await prisma.booking.updateMany({
    where: {
      id: booking.id,
      paymentStatus: "UNPAID",
    },
    data: {
      paymentStatus: "PAID",
      dodoPaymentId: payment.payment_id,
      ...(clash ? { status: "CANCELLED" } : {}),
    },
  });

  if (won.count === 0) {
    return { ok: true, duplicate: true };
  }

  // Refund payments made after cancellation or a slot conflict.
  if (dead || clash) {
    await refundBooking({
      id: booking.id,
      paymentStatus: "PAID",
      dodoPaymentId: payment.payment_id,
    });

    return { ok: true, refunded: true };
  }

  await emailNewRequest({
    to: booking.expert.user.email,
    studentName: booking.student.name,
    title: booking.service.title,
    startsAt: booking.startsAt,
    note: booking.note,
  });

  return { ok: true };
}
