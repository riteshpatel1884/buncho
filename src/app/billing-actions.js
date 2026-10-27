'use server';

import crypto from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { CASHFREE_MODE, createCashfreeOrder } from '@/lib/billing';
import { appUrl, createDodoCheckout, dodoConfigured, proProductId } from '@/lib/dodo';
import { PRO_PLAN_ID } from '@/lib/constants';
import { getQuote, monthsLabel } from '@/lib/pricing';

const MAX_PENDING_PER_HOUR = 5;
const asCurrency = (c) => (c === 'USD' ? 'USD' : 'INR');

/** Checks a promo code and returns the price the buyer would pay in each currency. Nothing is created. */
export async function previewPrice({ code } = {}) {
  try {
    const user = await getOrCreateUser();
    if (!user) return { ok: false, error: 'Log in to use a promo code.' };

    const [inr, usd] = await Promise.all([
      getQuote({ userId: user.id, code, currency: 'INR' }),
      getQuote({ userId: user.id, code, currency: 'USD' }),
    ]);
    if (inr.error) return { ok: false, error: inr.error };
    if (inr.source !== 'code') return { ok: false, error: 'Enter a promo code.' };

    const usdApplies = usd.source === 'code';
    return {
      ok: true,
      code: inr.code,
      inrRupees: Math.round(inr.finalPaise / 100),
      usdCents: usd.finalPaise,
      message: `${inr.code} applied: ${inr.dealLabel}${usdApplies ? '' : ' (INR payments only)'}`,
    };
  } catch (err) {
    console.error('[billing] previewPrice failed', err);
    return { ok: false, error: 'Could not check that code right now. Please try again.' };
  }
}

/**
 * Creates the payment record and the provider order.
 * INR -> { ok, provider: 'CASHFREE', orderId, paymentSessionId, mode }
 * USD -> { ok, provider: 'DODO', orderId, url }
 */
export async function startCheckout({ code, currency } = {}) {
  // Never let an error escape: an uncaught throw in a server action replaces the whole page with "This page couldn't load".
  try {
    const user = await getOrCreateUser();
    if (!user) return { ok: false, error: 'Log in to upgrade.', code: 'AUTH' };

    const cur = asCurrency(currency);
    if (cur === 'USD' && !dodoConfigured()) {
      return { ok: false, error: 'Paying in other currencies is not available right now. Please pay in INR.' };
    }

    const q = await getQuote({ userId: user.id, code, currency: cur });
    if (!q.settings.checkoutOpen) return { ok: false, error: 'Upgrades are paused right now. Please try again later.' };
    if (q.error) return { ok: false, error: q.error };

    const recent = await prisma.payment.count({
      where: { userId: user.id, status: 'PENDING', createdAt: { gte: new Date(Date.now() - 3600 * 1000) } },
    });
    if (recent >= MAX_PENDING_PER_HOUR) return { ok: false, error: 'Too many payment attempts. Please try again in a while.' };

    const orderId = `bnc_${crypto.randomUUID().replace(/-/g, '')}`;
    await prisma.payment.create({
      data: {
        orderId,
        userId: user.id,
        plan: PRO_PLAN_ID,
        provider: cur === 'USD' ? 'DODO' : 'CASHFREE',
        currency: cur,
        amountPaise: q.finalPaise,
        listPaise: q.listPaise,
        discountPaise: q.discountPaise,
        discountCode: q.source === 'code' ? q.code : null,
        bonusDays: q.bonusDays,
        periodMonths: q.months,
      },
    });

    try {
      if (cur === 'USD') {
        const session = await createDodoCheckout({
          orderId,
          amountCents: q.finalPaise,
          email: user.email,
          name: user.name,
          productId: proProductId(),
          returnUrl: `${appUrl()}/billing/return?order_id=${orderId}`,
          metadata: { kind: 'pro', user_id: user.id, plan: PRO_PLAN_ID },
        });
        await prisma.payment.update({ where: { orderId }, data: { dodoSessionId: session.session_id ?? null } });
        return { ok: true, provider: 'DODO', orderId, url: session.checkout_url };
      }

      const order = await createCashfreeOrder({
        orderId,
        amountPaise: q.finalPaise,
        customerId: user.id,
        email: user.email,
        name: user.name,
        note: `${q.settings.proName}, ${monthsLabel(q.months)}`,
      });
      if (!order.payment_session_id) throw new Error('No payment session returned.');
      return { ok: true, provider: 'CASHFREE', orderId, paymentSessionId: order.payment_session_id, mode: CASHFREE_MODE };
    } catch (err) {
      console.error('[billing] could not create order', err);
      await prisma.payment.update({ where: { orderId }, data: { status: 'FAILED' } }).catch(() => {});
      return { ok: false, error: 'We could not start the payment. Please try again.' };
    }
  } catch (err) {
    console.error('[billing] startCheckout failed', err?.code, err);
    return { ok: false, error: 'Payments are temporarily unavailable. Please try again in a few minutes.' };
  }
}