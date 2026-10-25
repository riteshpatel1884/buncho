'use server';

import crypto from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { CASHFREE_MODE, createCashfreeOrder } from '@/lib/billing';
import { PRO_PLAN_ID } from '@/lib/constants';
import { getQuote, monthsLabel } from '@/lib/pricing';

const MAX_PENDING_PER_HOUR = 5;

/** Checks a promo code and returns the price the buyer would pay with it. Nothing is created. */
export async function previewPrice({ code }) {
  const user = await getOrCreateUser();
  if (!user) return { ok: false, error: 'Log in to use a promo code.' };

  const q = await getQuote({ userId: user.id, code });
  if (q.error) return { ok: false, error: q.error };
  if (q.source !== 'code') return { ok: false, error: 'Enter a promo code.' };

  return { ok: true, code: q.code, finalRupees: Math.round(q.finalPaise / 100), message: `${q.code} applied: ${q.dealLabel}` };
}

export async function startCheckout({ code } = {}) {
  const user = await getOrCreateUser();
  if (!user) return { ok: false, error: 'Log in to upgrade.', code: 'AUTH' };

  const q = await getQuote({ userId: user.id, code });
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
      amountPaise: q.finalPaise,
      listPaise: q.listPaise,
      discountPaise: q.discountPaise,
      discountCode: q.source === 'code' ? q.code : null,
      bonusDays: q.bonusDays,
      periodMonths: q.months,
    },
  });

  try {
    const order = await createCashfreeOrder({
      orderId,
      amountPaise: q.finalPaise,
      customerId: user.id,
      email: user.email,
      name: user.name,
      note: `${q.settings.proName}, ${monthsLabel(q.months)}`,
    });
    if (!order.payment_session_id) throw new Error('No payment session returned.');
    return { ok: true, orderId, paymentSessionId: order.payment_session_id, mode: CASHFREE_MODE };
  } catch (err) {
    console.error('[billing] could not create order', err);
    await prisma.payment.update({ where: { orderId }, data: { status: 'FAILED' } });
    return { ok: false, error: 'We could not start the payment. Please try again.' };
  }
}