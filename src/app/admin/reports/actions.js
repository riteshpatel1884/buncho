'use server';

import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { isAdmin } from '@/lib/admin';

const STATUSES = ['OPEN', 'RESOLVED', 'DISMISSED'];

/** Sets a user report's status and the reply the user sees on /report. Admin only. */
export async function updateSupportReport(formData) {
  const user = await getOrCreateUser();
  if (!isAdmin(user)) notFound();

  const id = String(formData.get('id') ?? '').slice(0, 40);
  const status = String(formData.get('status') ?? '');
  if (!id || !STATUSES.includes(status)) return;
  const note = String(formData.get('adminNote') ?? '').trim().slice(0, 1000);

  const current = await prisma.supportReport.findUnique({ where: { id }, select: { status: true, resolvedAt: true } });
  if (!current) return;

  await prisma.supportReport.update({
    where: { id },
    data: {
      status,
      adminNote: note || null,
      // Only moves when the status really changes, so saving a note does not reset the date
      resolvedAt: status === 'OPEN' ? null : current.status !== status || !current.resolvedAt ? new Date() : current.resolvedAt,
    },
  });

  revalidatePath('/admin/reports');
  revalidatePath('/admin');
  revalidatePath('/report');
}