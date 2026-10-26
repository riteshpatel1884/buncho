'use server';

import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { isAdmin } from '@/lib/admin';
import { AD_PERIOD_MONTHS, AD_SLOTS } from '@/lib/ads';
import { addMonths } from '@/lib/pricing';

/* Every export is a public endpoint, so each one re-checks admin rights on the server. */

async function requireAdmin() {
  const user = await getOrCreateUser();
  if (!isAdmin(user)) notFound();
}

const go = (tab, kind, msg) => redirect(`/admin/ads?tab=${tab}&${kind}=${encodeURIComponent(msg)}`);
const idOf = (formData) => String(formData.get('id') ?? '').slice(0, 40);
const noteOf = (formData) => String(formData.get('adminNote') ?? '').trim().slice(0, 1000);

function refresh() {
  revalidatePath('/admin/ads');
  revalidatePath('/admin');
  revalidatePath('/problems');
}

/** PAID -> APPROVED. The banner goes live now and runs for one month. */
export async function approveAd(formData) {
  await requireAdmin();
  const id = idOf(formData);
  const ad = await prisma.adBooking.findUnique({ where: { id } });
  if (!ad || ad.status !== 'PAID') return go('awaiting', 'error', 'That booking is not waiting for approval any more.');

  const now = new Date();
  const clash = await prisma.adBooking.findFirst({
    where: { slot: ad.slot, status: 'APPROVED', endsAt: { gt: now }, id: { not: id } },
    select: { companyName: true, endsAt: true },
  });
  if (clash) {
    return go('awaiting', 'error', `${AD_SLOTS[ad.slot].label} is already live with ${clash.companyName}. End that banner first, or reject this one and refund it.`);
  }

  await prisma.adBooking.updateMany({
    where: { id, status: 'PAID' },
    data: {
      status: 'APPROVED',
      reviewedAt: now,
      startsAt: now,
      endsAt: addMonths(now, ad.periodMonths || AD_PERIOD_MONTHS),
      adminNote: noteOf(formData) || null,
    },
  });
  refresh();
  return go('live', 'ok', `${ad.companyName} is now live in ${AD_SLOTS[ad.slot].label}.`);
}

/** PAID -> REJECTED. Refund the payment by hand in the Dodo dashboard. */
export async function rejectAd(formData) {
  await requireAdmin();
  const id = idOf(formData);
  const ad = await prisma.adBooking.findUnique({ where: { id }, select: { status: true, companyName: true } });
  if (!ad || ad.status !== 'PAID') return go('awaiting', 'error', 'That booking is not waiting for approval any more.');

  await prisma.adBooking.updateMany({
    where: { id, status: 'PAID' },
    data: { status: 'REJECTED', reviewedAt: new Date(), adminNote: noteOf(formData) || null },
  });
  refresh();
  return go('awaiting', 'ok', `${ad.companyName} was rejected. Remember to refund the payment in the Dodo dashboard.`);
}

/** Ends a live banner right now. */
export async function endAd(formData) {
  await requireAdmin();
  const id = idOf(formData);
  const ad = await prisma.adBooking.findUnique({ where: { id }, select: { status: true, companyName: true } });
  if (!ad || ad.status !== 'APPROVED') return go('live', 'error', 'That banner is not live.');

  await prisma.adBooking.updateMany({ where: { id, status: 'APPROVED' }, data: { status: 'ENDED', endsAt: new Date() } });
  refresh();
  return go('past', 'ok', `${ad.companyName} was taken down.`);
}