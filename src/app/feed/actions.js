"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDbUser, isAdmin, getAdminUserIds } from "@/lib/user";
import { getPosts } from "@/lib/feed/feedQueries";
import { findContactInfo } from "@/lib/contactCheck";
import { TOPICS, MAX_POST, MAX_COMMENT } from "@/lib/feed/feed";
import { isAvatarColor, isAvatarIcon } from "@/lib/avatar";
import { notify, unnotify, findMentions, withoutMentions } from "@/lib/notifications";

const get = (fd, k) => String(fd.get(k) || "").trim();
const SIGN_IN = { error: "Sign in to do that." };
const NO_CONTACT = "Please remove phone numbers, emails, links and social handles. Everything stays on Buncho.";

// Next page of the feed. Anyone can read it, signed in or not.
// authorId is only honoured when it is the signed-in person's own id (the "My posts" tab).
export async function loadPosts({ cursor, topic, college, tab, sort, authorId, profileId }) {
  const me = await getDbUser();
  return getPosts({ viewerId: me?.id ?? null, cursor, topic, college, tab, sort, authorId: me && authorId === me.id ? me.id : null, profileId: profileId ? String(profileId) : null });
}

export async function createPost(_prev, formData) {
  const me = await getDbUser();
  if (!me) return SIGN_IN;

  // The admin can post without a profile, a service link or the daily limit.
  // Experts need an approved profile. Normal users (students) can post once their account is set up.
  const admin = await isAdmin();
  let expert = null;
  if (!admin) {
    if (me.role === "EXPERT") {
      expert = await prisma.expertProfile.findUnique({ where: { userId: me.id }, select: { id: true, status: true } });
      if (!expert || expert.status !== "ACTIVE") return { error: "You can post once your profile is approved." };
    } else if (me.role !== "STUDENT") {
      return { error: "Finish setting up your account to post." };
    }
  }

  const body = get(formData, "body");
  const topic = get(formData, "topic");
  const serviceId = get(formData, "serviceId");
  // Everyone except the admin must choose a topic. The admin may post with a topic or without one.
  if (topic ? !Object.hasOwn(TOPICS, topic) : !admin) return { error: "Choose a topic." };
  if (body.length < 20) return { error: "Write at least 20 characters." };
  if (body.length > MAX_POST) return { error: `Keep it under ${MAX_POST} characters.` };
  // A real @mention of a Buncho member is allowed; any other @handle, link, email or number is not.
  const mentioned = await findMentions(body);
  if (!admin && findContactInfo(withoutMentions(body, mentioned)).length) return { error: NO_CONTACT };

  // Only experts can link one of their services.
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

  const created = await prisma.post.create({ data: { authorId: me.id, body, topic: topic || null, serviceId: linked?.id ?? null } });
  // Tell the people mentioned. Runs after the response is sent, so posting stays fast.
  after(() => Promise.all(mentioned.map((u) => notify({ userId: u.id, actorId: me.id, type: "MENTION", postId: created.id, preview: body }))));
  revalidatePath("/feed");
  revalidatePath("/");
  return { ok: true };
}

// The author edits their own post (text and topic). Same rules as writing a new post.
export async function updatePost(postId, text, topic) {
  const me = await getDbUser();
  if (!me) return SIGN_IN;

  const post = await prisma.post.findUnique({ where: { id: String(postId) }, select: { id: true, authorId: true } });
  if (!post) return { error: "Post not found." };
  if (post.authorId !== me.id) return { error: "You can only edit your own posts." };

  const admin = await isAdmin();
  const body = String(text || "").trim();
  const nextTopic = String(topic || "").trim();

  if (nextTopic ? !Object.hasOwn(TOPICS, nextTopic) : !admin) return { error: "Choose a topic." };
  if (body.length < 20) return { error: "Write at least 20 characters." };
  if (body.length > MAX_POST) return { error: `Keep it under ${MAX_POST} characters.` };
  if (!admin && findContactInfo(withoutMentions(body, await findMentions(body))).length) return { error: NO_CONTACT };

  await prisma.post.update({ where: { id: post.id }, data: { body, topic: nextTopic || null } });
  revalidatePath("/feed");
  revalidatePath(`/feed/${post.id}`);
  return { ok: true, body, topic: nextTopic || null };
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
  const post = await prisma.post.findFirst({ where: { id: String(postId), hidden: false }, select: { id: true, authorId: true, body: true } });
  if (!post) return { error: "Post not found." };
  const existing = await prisma[model].findUnique({ where: key });
  if (existing) await prisma[model].delete({ where: key });
  else await prisma[model].create({ data: { postId: post.id, userId: me.id } });

  // A like tells the author. Taking the like back removes that notification again.
  if (model === "postLike") {
    if (existing) after(() => unnotify({ userId: post.authorId, actorId: me.id, type: "LIKE", postId: post.id }));
    else after(() => notify({ userId: post.authorId, actorId: me.id, type: "LIKE", postId: post.id, preview: post.body }));
  }
  return { ok: true, on: !existing };
}
export async function toggleLike(postId) {
  return toggle("postLike", postId);
}

export async function toggleSave(postId) {
  return toggle("postSave", postId);
}

// Counts one unique view of a post. Called by the post card once it has really been on screen.
// Signed-in people are counted by account, signed-out people by a random first-party cookie.
// The unique index on (postId, viewerKey) means the same person can never add a second view.
export async function recordView(postId) {
  const id = String(postId);
  const post = await prisma.post.findFirst({ where: { id, hidden: false }, select: { id: true, authorId: true } });
  if (!post) return { ok: false };

  const me = await getDbUser().catch(() => null);
  if (me?.id === post.authorId) return { ok: true, counted: false }; // your own views don't count

  let viewerKey;
  if (me) {
    viewerKey = `u:${me.id}`;
  } else {
    const jar = await cookies();
    let vid = jar.get("buncho_vid")?.value;
    if (!vid) {
      vid = crypto.randomUUID();
      jar.set("buncho_vid", vid, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
    }
    viewerKey = `a:${vid}`;
  }

  const { count } = await prisma.postView.createMany({ data: [{ postId: post.id, viewerKey }], skipDuplicates: true });
  return { ok: true, counted: count === 1 };
}

export async function toggleFollow(authorId) {
  const me = await getDbUser();
  if (!me) return SIGN_IN;
  if (me.id === authorId) return { error: "You can't follow yourself." };
  // Everyone already follows the admin automatically, so there is nothing to store.
  if ((await getAdminUserIds()).includes(String(authorId))) return { ok: true, on: true };
  const key = { followerId_followingId: { followerId: me.id, followingId: String(authorId) } };
  const author = await prisma.user.findUnique({ where: { id: String(authorId) }, select: { id: true } });
  if (!author) return { error: "Account not found." };
  const existing = await prisma.follow.findUnique({ where: key });
  if (existing) await prisma.follow.delete({ where: key });
  else await prisma.follow.create({ data: { followerId: me.id, followingId: author.id } });
  if (existing) after(() => unnotify({ userId: author.id, actorId: me.id, type: "FOLLOW" }));
  else after(() => notify({ userId: author.id, actorId: me.id, type: "FOLLOW" }));
  return { ok: true, on: !existing };
}

// The blue tick sits on the expert profile for experts, and on the account for everyone else.
const tickActive = (until) => !!until && until > new Date();

export async function loadComments(postId) {
  const [rows, adminIds] = await Promise.all([
    prisma.postComment.findMany({
      where: { postId: String(postId) },
      orderBy: { createdAt: "asc" },
      take: 100,
      include: { user: { select: { name: true, avatarUrl: true, avatarColor: true, avatarIcon: true, role: true, blueTickUntil: true, expertProfile: { select: { blueTickUntil: true } } } } },
    }),
    getAdminUserIds(),
  ]);
  return rows.map((c) => ({
    id: c.id,
    body: c.body,
    parentId: c.parentId,
    replyToName: c.parentId ? rows.find((r) => r.id === c.parentId)?.user.name ?? null : null,
    createdAt: c.createdAt.toISOString(),
    name: c.user.name,
    avatarUrl: c.user.avatarUrl,
    avatarColor: c.user.avatarColor,
    avatarIcon: c.user.avatarIcon,
    expert: c.user.role === "EXPERT",
    blueTick: !adminIds.includes(c.userId) && tickActive(c.user.expertProfile?.blueTickUntil ?? c.user.blueTickUntil),
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

export async function addComment(postId, text, parentId = null) {
  const me = await getDbUser();
  if (!me) return SIGN_IN;
  if (!me.role && !(await isAdmin())) return { error: "Finish setting up your account first." };
  const body = String(text || "").trim();
  if (body.length < 2) return { error: "Write a little more." };
  if (body.length > MAX_COMMENT) return { error: `Keep it under ${MAX_COMMENT} characters.` };
  const mentioned = await findMentions(body);
  if (findContactInfo(withoutMentions(body, mentioned)).length) return { error: NO_CONTACT };

  const post = await prisma.post.findFirst({ where: { id: String(postId), hidden: false }, select: { id: true, authorId: true } });
  if (!post) return { error: "Post not found." };

  let parent = null;
  if (parentId) {
    parent = await prisma.postComment.findFirst({ where: { id: String(parentId), postId: post.id }, select: { id: true, userId: true, user: { select: { name: true } } } });
    if (!parent) return { error: "That comment no longer exists." };
  }

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  if ((await prisma.postComment.count({ where: { userId: me.id, createdAt: { gte: hourAgo } } })) >= 20) {
    return { error: "You're commenting very fast. Please wait a bit." };
  }
  const [admin, profile] = await Promise.all([isAdmin(), prisma.expertProfile.findUnique({ where: { userId: me.id }, select: { blueTickUntil: true } })]);
  const c = await prisma.postComment.create({ data: { postId: post.id, userId: me.id, body, parentId: parent?.id ?? null } });

  // Tell people, one notification each: whoever was replied to, then the post's author, then anyone mentioned.
  after(async () => {
    const told = new Set([me.id]);
    const send = async (userId, type) => {
      if (!userId || told.has(userId)) return;
      told.add(userId);
      await notify({ userId, actorId: me.id, type, postId: post.id, commentId: c.id, preview: body });
    };
    await send(parent?.userId, "REPLY");
    await send(post.authorId, "COMMENT");
    for (const u of mentioned) await send(u.id, "MENTION");
  });
  return { ok: true, comment: { id: c.id, body, parentId: parent?.id ?? null, replyToName: parent?.user.name ?? null, createdAt: c.createdAt.toISOString(), name: me.name, avatarUrl: me.avatarUrl, avatarColor: me.avatarColor, avatarIcon: me.avatarIcon, expert: me.role === "EXPERT", blueTick: !admin && tickActive(profile?.blueTickUntil ?? me.blueTickUntil), official: admin } };
}

// Lets a person choose how their avatar looks: a color and either their letters, an icon or their photo.
// The admin always shows the official Buncho mark, so it can't be changed.
export async function updateAvatar(color, icon) {
  const me = await getDbUser();
  if (!me) return SIGN_IN;
  if (await isAdmin()) return { error: "The official Buncho avatar can't be changed." };
  if (!isAvatarColor(color) || !isAvatarIcon(icon)) return { error: "Pick one of the options." };

  await prisma.user.update({ where: { id: me.id }, data: { avatarColor: String(color).toLowerCase(), avatarIcon: icon } });
  revalidatePath("/", "layout");
  return { ok: true };
}