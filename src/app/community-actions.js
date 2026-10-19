'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { isAdmin } from '@/lib/admin';
import { displayName, formatDate, hasUnlocked } from '@/lib/community';
import {
  REPORT_REASONS,
  REPORT_AUTOHIDE_THRESHOLD,
  MAX_COMMENT_LENGTH,
  MAX_REPORT_DETAILS,
} from '@/lib/constants';

const fail = (error) => ({ ok: false, error });
const SIGN_IN = 'You need to sign in first.';
const LOCKED = 'Attempt this problem first to use community solutions.';

async function getPublishedAnswer(answerId) {
  if (typeof answerId !== 'string') return null;
  return prisma.communityAnswer.findFirst({
    where: { id: answerId, status: 'PUBLISHED', problem: { published: true } },
    select: { id: true, userId: true, problemId: true, problem: { select: { slug: true } } },
  });
}

function refresh(slug) {
  revalidatePath(`/problems/${slug}`);
  revalidatePath('/dashboard');
}

/* ---------- Sharing your own answer ---------- */

/** Publishes (or updates) a public copy of the user's saved private answer. */
export async function shareAnswer(problemId, { anonymous = false } = {}) {
  const user = await getOrCreateUser();
  if (!user) return fail(SIGN_IN);

  const problem = await prisma.problem.findFirst({
    where: { id: String(problemId), published: true },
    select: { id: true, slug: true },
  });
  if (!problem) return fail('This problem no longer exists.');

  const key = { userId_problemId: { userId: user.id, problemId: problem.id } };
  const submission = await prisma.submission.findUnique({ where: key });
  if (!submission) return fail('Save your answer before sharing it.');

  const existing = await prisma.communityAnswer.findUnique({ where: key, select: { status: true } });
  if (existing?.status === 'HIDDEN') {
    return fail('A moderator hid your shared answer, so it cannot be published again.');
  }

  const data = { content: submission.content, anonymous: Boolean(anonymous), status: 'PUBLISHED' };
  await prisma.communityAnswer.upsert({
    where: key,
    update: data,
    create: { userId: user.id, problemId: problem.id, ...data },
  });

  refresh(problem.slug);
  return { ok: true };
}

/** Takes the public copy down. Votes and reports are kept in case the user shares again. */
export async function unshareAnswer(problemId) {
  const user = await getOrCreateUser();
  if (!user) return fail(SIGN_IN);

  const problem = await prisma.problem.findFirst({
    where: { id: String(problemId) },
    select: { id: true, slug: true },
  });
  if (!problem) return fail('This problem no longer exists.');

  await prisma.communityAnswer.updateMany({
    where: { userId: user.id, problemId: problem.id, status: 'PUBLISHED' },
    data: { status: 'UNSHARED' },
  });

  refresh(problem.slug);
  return { ok: true };
}

/* ---------- Helpful votes and bookmarks ---------- */

export async function toggleHelpful(answerId) {
  const user = await getOrCreateUser();
  if (!user) return fail(SIGN_IN);

  const answer = await getPublishedAnswer(answerId);
  if (!answer) return fail('This answer is no longer available.');
  if (answer.userId === user.id) return fail('You cannot mark your own answer as helpful.');
  if (!(await hasUnlocked(user.id, answer.problemId))) return fail(LOCKED);

  const where = { userId: user.id, answerId: answer.id };
  const existing = await prisma.answerVote.findFirst({ where, select: { id: true } });

  if (existing) {
    await prisma.answerVote.deleteMany({ where });
  } else {
    try {
      await prisma.answerVote.create({ data: where });
    } catch (e) {
      // The unique (userId, answerId) constraint stops duplicate votes even on a double click
      if (e.code !== 'P2002') throw e;
    }
  }

  const count = await prisma.answerVote.count({ where: { answerId: answer.id } });
  return { ok: true, voted: !existing, count };
}

export async function toggleAnswerBookmark(answerId) {
  const user = await getOrCreateUser();
  if (!user) return fail(SIGN_IN);

  const answer = await getPublishedAnswer(answerId);
  if (!answer) return fail('This answer is no longer available.');
  if (!(await hasUnlocked(user.id, answer.problemId))) return fail(LOCKED);

  const where = { userId: user.id, answerId: answer.id };
  const existing = await prisma.answerBookmark.findFirst({ where, select: { id: true } });

  if (existing) {
    await prisma.answerBookmark.deleteMany({ where });
  } else {
    try {
      await prisma.answerBookmark.create({ data: where });
    } catch (e) {
      if (e.code !== 'P2002') throw e;
    }
  }

  revalidatePath('/dashboard');
  return { ok: true, saved: !existing };
}

/* ---------- Reporting ---------- */

export async function reportAnswer(answerId, reason, details) {
  const user = await getOrCreateUser();
  if (!user) return fail(SIGN_IN);

  const answer = await getPublishedAnswer(answerId);
  if (!answer) return fail('This answer is no longer available.');
  if (answer.userId === user.id) return fail('You cannot report your own answer.');
  if (!REPORT_REASONS.includes(reason)) return fail('Choose a reason for the report.');
  if (!(await hasUnlocked(user.id, answer.problemId))) return fail(LOCKED);

  const cleanDetails = String(details ?? '').trim().slice(0, MAX_REPORT_DETAILS) || null;

  try {
    await prisma.report.create({
      data: { reporterId: user.id, answerId: answer.id, reason, details: cleanDetails },
    });
  } catch (e) {
    if (e.code === 'P2002') return fail('You have already reported this answer.');
    throw e;
  }

  // Reporters are unique per answer, so this counts distinct users.
  const open = await prisma.report.count({ where: { answerId: answer.id, status: 'OPEN' } });
  if (open >= REPORT_AUTOHIDE_THRESHOLD) {
    await prisma.communityAnswer.updateMany({
      where: { id: answer.id, status: 'PUBLISHED' },
      data: { status: 'HIDDEN' },
    });
  }

  revalidatePath('/admin/reports');
  refresh(answer.problem.slug);
  return { ok: true };
}

/* ---------- Discussion ---------- */

function shapeComment(c, viewerId) {
  return {
    id: c.id,
    content: c.content,
    author: displayName(c.user.name),
    dateLabel: formatDate(c.createdAt),
    mine: c.userId === viewerId,
  };
}

export async function getComments(answerId) {
  const user = await getOrCreateUser();
  if (!user) return fail(SIGN_IN);

  const answer = await getPublishedAnswer(answerId);
  if (!answer) return fail('This answer is no longer available.');
  if (!(await hasUnlocked(user.id, answer.problemId))) return fail(LOCKED);

  const rows = await prisma.answerComment.findMany({
    where: { answerId: answer.id },
    orderBy: { createdAt: 'asc' },
    take: 100,
    include: { user: { select: { name: true } } },
  });
  return { ok: true, comments: rows.map((c) => shapeComment(c, user.id)) };
}

export async function addComment(answerId, content) {
  const user = await getOrCreateUser();
  if (!user) return fail(SIGN_IN);

  const answer = await getPublishedAnswer(answerId);
  if (!answer) return fail('This answer is no longer available.');
  if (!(await hasUnlocked(user.id, answer.problemId))) return fail(LOCKED);

  const text = String(content ?? '').trim();
  if (!text) return fail('Write something before posting.');
  if (text.length > MAX_COMMENT_LENGTH) return fail(`Comments can be up to ${MAX_COMMENT_LENGTH} characters.`);

  // Simple throttle: at most 5 comments per minute per user
  const recent = await prisma.answerComment.count({
    where: { userId: user.id, createdAt: { gt: new Date(Date.now() - 60_000) } },
  });
  if (recent >= 5) return fail('You are commenting too quickly. Wait a minute and try again.');

  const created = await prisma.answerComment.create({
    data: { answerId: answer.id, userId: user.id, content: text },
    include: { user: { select: { name: true } } },
  });

  return { ok: true, comment: shapeComment(created, user.id) };
}

export async function deleteComment(commentId) {
  const user = await getOrCreateUser();
  if (!user) return fail(SIGN_IN);
  if (typeof commentId !== 'string') return fail('Comment not found.');

  const comment = await prisma.answerComment.findUnique({
    where: { id: commentId },
    select: { id: true, userId: true },
  });
  if (!comment) return fail('Comment not found.');
  if (comment.userId !== user.id && !isAdmin(user)) return fail('You can only delete your own comments.');

  await prisma.answerComment.delete({ where: { id: comment.id } });
  return { ok: true };
}

/* ---------- Moderation (admins only) ---------- */

/**
 * 'hide'    -> hide the answer for good and mark its open reports as actioned.
 * 'dismiss' -> reports were unfounded: restore the answer if it was auto-hidden.
 */
export async function moderateAnswer(answerId, decision) {
  const user = await getOrCreateUser();
  if (!isAdmin(user)) return fail('Not allowed.');
  if (typeof answerId !== 'string' || !['hide', 'dismiss'].includes(decision)) return fail('Invalid request.');

  const answer = await prisma.communityAnswer.findUnique({
    where: { id: answerId },
    select: { id: true, problem: { select: { slug: true } } },
  });
  if (!answer) return fail('Answer not found.');

  const now = new Date();
  if (decision === 'hide') {
    await prisma.$transaction([
      prisma.communityAnswer.update({ where: { id: answer.id }, data: { status: 'HIDDEN' } }),
      prisma.report.updateMany({
        where: { answerId: answer.id, status: 'OPEN' },
        data: { status: 'ACTIONED', resolvedAt: now },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.communityAnswer.updateMany({ where: { id: answer.id, status: 'HIDDEN' }, data: { status: 'PUBLISHED' } }),
      prisma.report.updateMany({
        where: { answerId: answer.id, status: 'OPEN' },
        data: { status: 'DISMISSED', resolvedAt: now },
      }),
    ]);
  }

  revalidatePath('/admin/reports');
  refresh(answer.problem.slug);
  return { ok: true };
}