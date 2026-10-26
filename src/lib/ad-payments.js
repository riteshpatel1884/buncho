import { prisma } from './prisma';
import { getDodoPayment } from './dodo';

/**
 * Asks Dodo what happened to this booking's payment, then updates our record.
 * Returns 'paid' | 'pending' | 'failed' | 'unknown'.
 * Nothing in a webhook or return URL is trusted: the payment is fetched from Dodo and must carry our order id.
 */
export async function settleAdPayment(orderId, paymentId = null) {
  const booking = await prisma.adBooking.findUnique({ where: { orderId } });
  if (!booking) return 'unknown';
  if (['PAID', 'APPROVED', 'REJECTED', 'ENDED'].includes(booking.status)) return 'paid';
  if (booking.status === 'FAILED') return 'failed';

  const pid = paymentId || booking.dodoPaymentId;
  if (!pid) return 'pending';

  const payment = await getDodoPayment(pid);

  // The payment must belong to this booking (stops one real payment being replayed against other bookings)
  if (payment?.metadata?.order_id !== orderId) {
    console.error('[ads] payment does not belong to this booking', orderId, pid);
    return 'failed';
  }

  if (payment.status === 'succeeded') {
    // Dodo may add tax on top, so the total can be higher than the banner price, never lower
    if (payment.currency !== booking.currency || Number(payment.total_amount) < booking.amountCents) {
      console.error('[ads] amount mismatch', orderId, payment.total_amount, payment.currency);
      return 'failed';
    }
    await prisma.adBooking.updateMany({
      where: { orderId, status: 'PENDING_PAYMENT' },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        dodoPaymentId: pid,
        paymentMethod: payment.payment_method ? String(payment.payment_method) : null,
        payerEmail: payment.customer?.email ?? null,
      },
    });
    return 'paid';
  }

  if (payment.status === 'failed' || payment.status === 'cancelled') return 'failed';
  return 'pending';
}