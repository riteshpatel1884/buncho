'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import {
  EMAIL_PATTERN,
  ISSUES,
  MAX_DETAILS,
  MAX_PER_DAY,
  MAX_PER_HOUR,
  MIN_DETAILS,
  SUPPORT_KINDS,
  TRANSACTION_PATTERN,
} from '@/lib/support';

/** Finds published questions by title or keyword, for the "which question?" search box. */
export async function searchProblemsForReport(query) {
  const user = await getOrCreateUser();
  if (!user) return [];
  const q = String(query ?? '').trim().slice(0, 80);
  if (q.length < 2) return [];

  return prisma.problem.findMany({
    where: {
      published: true,
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q.toLowerCase().replace(/\s+/g, '-') } },
      ],
    },
    orderBy: { title: 'asc' },
    take: 8,
    select: { id: true, slug: true, title: true, difficulty: true, topic: { select: { name: true } } },
  });
}

const fail = (error) => ({ ok: false, error });

/** Saves a report. Everything is checked here again, because this is a public endpoint. */
export async function submitReport(input) {
  const user = await getOrCreateUser();
  if (!user) return fail('Please log in to send a report.');

  const kind = input?.kind;
  if (!SUPPORT_KINDS.includes(kind)) return fail('Choose what you want to report.');

  const issue = ISSUES[kind].find((i) => i.id === input?.issue);
  if (!issue) return fail('Choose what the problem is.');

  const details = String(input?.details ?? '').trim();
  if (details.length < MIN_DETAILS) return fail('Please describe the problem in a few more words.');
  if (details.length > MAX_DETAILS) return fail(`Please keep the description under ${MAX_DETAILS} characters.`);

  let problemId = null;
  if (kind === 'PROBLEM') {
    const problem = await prisma.problem.findFirst({
      where: { id: String(input?.problemId ?? ''), published: true },
      select: { id: true },
    });
    if (!problem) return fail('Pick the question you are reporting.');
    problemId = problem.id;

    const open = await prisma.supportReport.findFirst({
      where: { userId: user.id, problemId, kind: 'PROBLEM', status: 'OPEN' },
      select: { id: true },
    });
    if (open) return fail('You already have an open report for this question. We are looking into it.');
  }

  let transactionId = null;
  if (kind === 'PRO_PLAN') {
    const raw = String(input?.transactionId ?? '').trim().slice(0, 64);
    if (raw) {
      if (!TRANSACTION_PATTERN.test(raw)) return fail('That transaction ID does not look right. Copy it from your payment message or bank app.');
      transactionId = raw;
    } else if (issue.needsTransaction && input?.noTransaction !== true) {
      return fail('Add your payment transaction ID so we can find your payment quickly, or tick "I can\'t find it".');
    }
  }

  const emailRaw = String(input?.contactEmail ?? '').trim().slice(0, 120);
  if (emailRaw && !EMAIL_PATTERN.test(emailRaw)) return fail('That email address does not look right.');

  const now = Date.now();
  const [lastHour, lastDay] = await Promise.all([
    prisma.supportReport.count({ where: { userId: user.id, createdAt: { gte: new Date(now - 3600 * 1000) } } }),
    prisma.supportReport.count({ where: { userId: user.id, createdAt: { gte: new Date(now - 86400 * 1000) } } }),
  ]);
  if (lastHour >= MAX_PER_HOUR || lastDay >= MAX_PER_DAY) return fail('You have sent a lot of reports. Please try again later.');

  const report = await prisma.supportReport.create({
    data: {
      userId: user.id,
      kind,
      issue: issue.id,
      problemId,
      details,
      transactionId,
      contactEmail: emailRaw || null,
    },
    select: { id: true },
  });

  revalidatePath('/report');
  revalidatePath('/admin/reports');
  revalidatePath('/admin');
  return { ok: true, ref: report.id.slice(-8).toUpperCase() };
}