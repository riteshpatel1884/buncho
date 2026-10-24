'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { isAdmin } from '@/lib/admin';
import { liveWhere, getFeedbackCounts } from '@/lib/blog';
import { displayName } from '@/lib/community';
import { formatDateTimeIST } from '@/lib/datetime';
import { COMMENTS_PER_HOUR, MAX_COMMENT_LENGTH } from '@/lib/blog-constants';

const fail = (error) => ({ ok: false, error });
const SIGN_IN = 'Sign in to do that.';

async function livePost(postId) {
  if (typeof postId !== 'string') return null;
  return prisma.blogPost.findFirst({ where: { id: postId, ...liveWhere() }, select: { id: true, slug: true } });
}

export async function toggleLike(postId) {
  const user = await getOrCreateUser();
  if (!user) return fail(SIGN_IN);
  const post = await livePost(postId);
  if (!post) return fail('This article is no longer available.');

  const key = { postId_userId: { postId: post.id, userId: user.id } };
  const existing = await prisma.blogLike.findUnique({ where: key, select: { id: true } });
  if (existing) await prisma.blogLike.delete({ where: key });
  else await prisma.blogLike.create({ data: { postId: post.id, userId: user.id } }).catch(() => {}); // double click race: unique constraint

  const count = await prisma.blogLike.count({ where: { postId: post.id } });
  revalidatePath(`/blog/${post.slug}`);
  return { ok: true, liked: !existing, count };
}

export async function submitHelpful(postId, helpful) {
  const user = await getOrCreateUser();
  if (!user) return fail(SIGN_IN);
  const post = await livePost(postId);
  if (!post) return fail('This article is no longer available.');

  const value = helpful === true;
  await prisma.blogFeedback.upsert({
    where: { postId_userId: { postId: post.id, userId: user.id } },
    update: { helpful: value },
    create: { postId: post.id, userId: user.id, helpful: value },
  });
  revalidatePath(`/blog/${post.slug}`);
  return { ok: true, ...(await getFeedbackCounts(post.id)) };
}

export async function addComment(postId, content) {
  const user = await getOrCreateUser();
  if (!user) return fail(SIGN_IN);
  const post = await livePost(postId);
  if (!post) return fail('This article is no longer available.');

  const text = String(content ?? '').replace(/\r\n/g, '\n').trim();
  if (text.length < 2) return fail('Write a little more before posting.');
  if (text.length > MAX_COMMENT_LENGTH) return fail(`Comments are limited to ${MAX_COMMENT_LENGTH} characters.`);

  const recent = await prisma.blogComment.count({
    where: { userId: user.id, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
  });
  if (recent >= COMMENTS_PER_HOUR) return fail('You are commenting too quickly. Please try again later.');

  const row = await prisma.blogComment.create({ data: { postId: post.id, userId: user.id, content: text } });
  revalidatePath(`/blog/${post.slug}`);
  return {
    ok: true,
    comment: { id: row.id, content: row.content, author: displayName(user.name), when: formatDateTimeIST(row.createdAt), canDelete: true },
  };
}

/** Authors can delete their own comments; admins can delete any (that is the moderation tool). */
export async function deleteComment(commentId) {
  const user = await getOrCreateUser();
  if (!user) return fail(SIGN_IN);
  const comment = await prisma.blogComment.findUnique({
    where: { id: String(commentId) },
    select: { id: true, userId: true, post: { select: { slug: true } } },
  });
  if (!comment) return fail('That comment no longer exists.');
  if (comment.userId !== user.id && !isAdmin(user)) return fail('You cannot delete this comment.');
  await prisma.blogComment.delete({ where: { id: comment.id } });
  revalidatePath(`/blog/${comment.post.slug}`);
  return { ok: true };
}
