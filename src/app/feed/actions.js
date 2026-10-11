"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getDbUser, isAdmin, getAdminUserIds } from "@/lib/user";
import { getPosts } from "@/lib/feed/feedQueries";
import { findContactInfo } from "@/lib/contactCheck";
import { TOPICS, MAX_POST, MAX_COMMENT } from "@/lib/feed/feed";

const get = (fd, k) => String(fd.get(k) || "").trim();
const SIGN_IN = { error: "Sign in to do that." };
const NO_CONTACT = "Please remove phone numbers, emails, links and social handles. Everything stays on Buncho.";

// Next page of the feed. Anyone can read it, signed in or not.
export async function loadPosts({ cursor, topic, college, tab, authorId }) {
  const me = await getDbUser();
  return getPosts({ viewerId: me?.id ?? null, cursor, topic, college, tab, authorId: me && authorId === me.id ? me.id : null });
}

export async function createPost(_prev, formData) {
  const me = await getDbUser();
  if (!me) return SIGN_IN;

  // The admin can post without an expert profile, a service link or the daily limit.
  const admin = await isAdmin();
  let expert = null;
  if (!admin) {
    if (me.role !== "EXPERT") return { error: "Only experts can post." };
    expert = await prisma.expertProfile.findUnique({ where: { userId: me.id }, select: { id: true, status: true } });
    if (!expert || expert.status !== "ACTIVE") return { error: "You can post once your profile is approved." };
  }

  const body = get(formData, "body");
  const topic = get(formData, "topic");
  const serviceId = get(formData, "serviceId");
  // Experts must choose a topic. The admin may post with a topic or without one.
  if (topic ? !Object.hasOwn(TOPICS, topic) : !admin) return { error: "Choose a topic." };
  if (body.length < 20) return { error: "Write at least 20 characters." };
  if (body.length > MAX_POST) return { error: `Keep it under ${MAX_POST} characters.` };
  if (!admin && findContactInfo(body).length) return { error: NO_CONTACT };

  let linked = null;
  if (serviceId && expert) {
    linked = await prisma.service.findFirst({ where: { id: serviceId, expertId: expert.id, active: true }, select: { id: true } });
    if (!linked) return { error: "That service isn't available." };
  }

  if (!admin) {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if ((await prisma.post.count({ where: { authorId: me.id, createdAt: { gte: dayAgo } } })) >= 10) {
      return { error: "You've reached today's posting limit. Try again tomorrow." };
    }
  }

  await prisma.post.create({ data: { authorId: me.id, body, topic: topic || null, serviceId: linked?.id ?? null } });
  revalidatePath("/feed");
  return { ok: true };
}

export async function deletePost(postId) {
  const me = await getDbUser();
  if (!me) return SIGN_IN;
  const post = await prisma.post.findUnique({ where: { id: String(postId) }, select: { id: true, authorId: true } });
  if (!post) return { ok: true };
  if (post.authorId !== me.id && !(await isAdmin())) return { error: "Not allowed." };
  await prisma.post.delete({ where: { id: post.id } });
  revalidatePath("/feed");
  return { ok: true };
}

// Like and save are the same shape: add the row if it is missing, remove it if it is there.
async function toggle(model, postId) {
  const me = await getDbUser();
  if (!me) return SIGN_IN;
  const key = { postId_userId: { postId: String(postId), userId: me.id } };
  const post = await prisma.post.findFirst({ where: { id: String(postId), hidden: false }, select: { id: true } });
  if (!post) return { error: "Post not found." };
  const existing = await prisma[model].findUnique({ where: key });
  if (existing) await prisma[model].delete({ where: key });
  else await prisma[model].create({ data: { postId: post.id, userId: me.id } });
  return { ok: true, on: !existing };
}
export async function toggleLike(postId) {
  return toggle("postLike", postId);
}

export async function toggleSave(postId) {
  return toggle("postSave", postId);
}

export async function toggleFollow(authorId) {
  const me = await getDbUser();
  if (!me) return SIGN_IN;
  if (me.id === authorId) return { error: "You can't follow yourself." };
  // Everyone already follows the admin automatically, so there is nothing to store.
  if ((await getAdminUserIds()).includes(String(authorId))) return { ok: true, on: true };
  const key = { followerId_followingId: { followerId: me.id, followingId: String(authorId) } };
  const author = await prisma.user.findUnique({ where: { id: String(authorId) }, select: { id: true } });
  if (!author) return { error: "Expert not found." };
  const existing = await prisma.follow.findUnique({ where: key });
  if (existing) await prisma.follow.delete({ where: key });
  else await prisma.follow.create({ data: { followerId: me.id, followingId: author.id } });
  return { ok: true, on: !existing };
}

export async function loadComments(postId) {
  const [rows, adminIds] = await Promise.all([
    prisma.postComment.findMany({
      where: { postId: String(postId) },
      orderBy: { createdAt: "asc" },
      take: 100,
      include: { user: { select: { name: true, avatarUrl: true, role: true } } },
    }),
    getAdminUserIds(),
  ]);
  return rows.map((c) => ({
    id: c.id,
    body: c.body,
    createdAt: c.createdAt.toISOString(),
    name: c.user.name,
    avatarUrl: c.user.avatarUrl,
    expert: c.user.role === "EXPERT",
    official: adminIds.includes(c.userId),
  }));
}

// Admin only: remove any reply on any post.
export async function deleteComment(commentId) {
  if (!(await isAdmin())) return { error: "Not allowed." };
  await prisma.postComment.deleteMany({ where: { id: String(commentId) } });
  revalidatePath("/feed");
  return { ok: true };
}

export async function addComment(postId, text) {
  const me = await getDbUser();
  if (!me) return SIGN_IN;
  if (!me.role && !(await isAdmin())) return { error: "Finish setting up your account first." };
  const body = String(text || "").trim();
  if (body.length < 2) return { error: "Write a little more." };
  if (body.length > MAX_COMMENT) return { error: `Keep it under ${MAX_COMMENT} characters.` };
  if (findContactInfo(body).length) return { error: NO_CONTACT };

  const post = await prisma.post.findFirst({ where: { id: String(postId), hidden: false }, select: { id: true } });
  if (!post) return { error: "Post not found." };

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  if ((await prisma.postComment.count({ where: { userId: me.id, createdAt: { gte: hourAgo } } })) >= 20) {
    return { error: "You're commenting very fast. Please wait a bit." };
  }
  const c = await prisma.postComment.create({ data: { postId: post.id, userId: me.id, body } });
  return { ok: true, comment: { id: c.id, body, createdAt: c.createdAt.toISOString(), name: me.name, avatarUrl: me.avatarUrl, expert: me.role === "EXPERT", official: await isAdmin() } };
}