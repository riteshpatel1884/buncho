import { NextResponse } from 'next/server';
import { getDodoPayment, verifyDodoWebhook } from '@/lib/dodo';
import { settleAdPayment } from '@/lib/ad-payments';

export const runtime = 'nodejs';

/**
 * Dodo dashboard > Developers > Webhooks: https://<your-domain>/api/ads/webhook, event "payment.succeeded".
 * The payload is never trusted for amount or status: the payment is re-fetched from Dodo before anything is saved.
 */
export async function POST(req) {
  const raw = await req.text(); // the signature covers the exact raw body

  let valid = false;
  try {
    valid = verifyDodoWebhook(raw, req.headers);
  } catch (err) {
    console.error('[ads] webhook could not be verified', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  if (!valid) return NextResponse.json({ ok: false }, { status: 400 });

  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: true });
  }

  if (event?.type === 'payment.succeeded') {
    const data = event.data ?? {};
    try {
      let orderId = data.metadata?.order_id;
      if (!orderId && data.payment_id) orderId = (await getDodoPayment(data.payment_id))?.metadata?.order_id;
      if (typeof orderId === 'string' && orderId.startsWith('ad_')) {
        await settleAdPayment(orderId, data.payment_id ?? null);
      }
    } catch (err) {
      console.error('[ads] webhook settle failed', err);
      return NextResponse.json({ ok: false }, { status: 500 }); // non-2xx makes Dodo retry
    }
  }
  return NextResponse.json({ ok: true });
}