import { NextResponse } from 'next/server';
import { verifyAndSettle, verifyWebhookSignature } from '@/lib/billing';

export const runtime = 'nodejs';

/**
 * Cashfree dashboard > Developers > Webhooks: https://<your-domain>/api/billing/webhook, event "Payment Success".
 * The payload is never trusted for amount/status: the order is re-fetched from Cashfree before granting anything.
 */
export async function POST(req) {
  const raw = await req.text(); // signature covers the exact raw body

  let valid = false;
  try {
    valid = verifyWebhookSignature(raw, req.headers.get('x-webhook-signature'), req.headers.get('x-webhook-timestamp'));
  } catch (err) {
    console.error('[billing] webhook could not be verified', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  if (!valid) return NextResponse.json({ ok: false }, { status: 400 });

  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: true });
  }

  if (event?.type === 'PAYMENT_SUCCESS_WEBHOOK') {
    const orderId = event?.data?.order?.order_id;
    const cfPaymentId = event?.data?.payment?.cf_payment_id ?? null;
    if (typeof orderId === 'string' && orderId.startsWith('bnc_')) {
      try {
        await verifyAndSettle(orderId, cfPaymentId);
      } catch (err) {
        console.error('[billing] webhook settle failed', orderId, err);
        return NextResponse.json({ ok: false }, { status: 500 }); // non-2xx makes Cashfree retry
      }
    }
  }
  return NextResponse.json({ ok: true });
}