'use server';

import crypto from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { CASHFREE_MODE, createCashfreeOrder } from '@/lib/billing';
import { PRO_PERIOD_DAYS, PRO_PLAN_ID, PRO_PRICE_INR } from '@/lib/constants';

const MAX_PENDING_PER_HOUR = 5;

export async function startCheckout({ phone }) {
  const user = await getOrCreateUser();
  if (!user) return { ok: false, error: 'Log in to upgrade.', code: 'AUTH' };

  const digits = String(phone ?? '').replace(/\D/g, '').slice(-10);
  if (!/^[6-9]\d{9}$/.test(digits)) return { ok: false, error: 'Enter a valid 10 digit mobile number.' };

  const recent = await prisma.payment.count({
    where: { userId: user.id, status: 'PENDING', createdAt: { gte: new Date(Date.now() - 3600 * 1000) } },
  });
  if (recent >= MAX_PENDING_PER_HOUR) return { ok: false, error: 'Too many payment attempts. Please try again in a while.' };

  const orderId = `bnc_${crypto.randomUUID().replace(/-/g, '')}`;
  await prisma.payment.create({
    data: { orderId, userId: user.id, plan: PRO_PLAN_ID, amountPaise: PRO_PRICE_INR * 100 },
  });

  try {
    const order = await createCashfreeOrder({
      orderId,
      amountPaise: PRO_PRICE_INR * 100,
      customerId: user.id,
      phone: digits,
      email: user.email,
      name: user.name,
      note: `Buncho Pro, ${PRO_PERIOD_DAYS} days`,
    });
    if (!order.payment_session_id) throw new Error('No payment session returned.');
    return { ok: true, orderId, paymentSessionId: order.payment_session_id, mode: CASHFREE_MODE };
  } catch (err) {
    console.error('[billing] could not create order', err);
    await prisma.payment.update({ where: { orderId }, data: { status: 'FAILED' } });
    return { ok: false, error: 'We could not start the payment. Please try again.' };
  }
}