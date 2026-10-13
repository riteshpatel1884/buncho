import { prisma } from "@/lib/prisma";
import { sendPush } from "@/lib/push";
import { notificationText, notificationHref } from "@/lib/notifyText";

// ---------- Mentions ----------
// "@ritesh_01" in a post or reply. Usernames are 3 to 20 characters: a-z, 0-9 and _, starting with a letter.
const MENTION = /(^|\s)@([a-z][a-z0-9_]{2,19})\b/gi;

// The real Buncho people named with @ in this text (at most 10).
export async function findMentions(text) {
  const names = [...new Set([...String(text || "").matchAll(MENTION)].map((m) => m[2].toLowerCase()))].slice(0, 10);
  if (!names.length) return [];
  return prisma.user.findMany({ where: { username: { in: names } }, select: { id: true, username: true } });
}

// The contact-info check blocks "@handles". A real @mention of a Buncho member is fine, so swap those
// for a plain word before checking. Anything else with an @ still gets caught.
export function withoutMentions(text, people) {
  const ok = new Set(people.map((p) => String(p.username).toLowerCase()));
  return String(text || "").replace(MENTION, (m, lead, name) => (ok.has(name.toLowerCase()) ? `${lead}member` : m));
}

// ---------- Creating notifications ----------
const clip = (s) => {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  return t ? (t.length > 90 ? `${t.slice(0, 87)}…` : t) : null;
};

// type: FOLLOW | LIKE | COMMENT | REPLY | MENTION | MESSAGE
// Safe to call from anywhere: it skips yourself, skips repeats of a like or follow, and never throws.
export async function notify({ userId, actorId = null, type, postId = null, commentId = null, preview = null }) {
  try {
    if (!userId || userId === actorId) return;
    if (type === "LIKE" || type === "FOLLOW") {
      const dup = await prisma.notification.findFirst({ where: { userId, actorId, type, postId }, select: { id: true } });
      if (dup) return;
    }
    await prisma.notification.create({ data: { userId, actorId, type, postId, commentId, preview: clip(preview) } });

    const actor = actorId
      ? await prisma.user.findUnique({ where: { id: actorId }, select: { name: true, expertProfile: { select: { slug: true } } } })
      : null;
    await sendPush(userId, {
      title: "Buncho",
      body: notificationText(type, actor?.name),
      url: notificationHref({ type, postId, actorSlug: actor?.expertProfile?.slug }),
      tag: `${type}:${postId ?? actorId ?? ""}`,
    });
  } catch (err) {
    console.error("notify failed", err);
  }
}

// Undo a like or follow: the notification goes away with it.
export async function unnotify({ userId, actorId, type, postId = null }) {
  try {
    await prisma.notification.deleteMany({ where: { userId, actorId, type, postId } });
  } catch (err) {
    console.error("unnotify failed", err);
  }
}

// ---------- Reading notifications ----------
// Newest first, shaped for the client (plain data only).
export async function listNotifications(userId, take = 15) {
  const rows = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      actor: { select: { name: true, avatarUrl: true, avatarColor: true, avatarIcon: true, expertProfile: { select: { slug: true } } } },
    },
  });
  return rows.map((n) => ({
    id: n.id,
    type: n.type,
    text: notificationText(n.type, n.actor?.name),
    preview: n.preview,
    href: notificationHref({ type: n.type, postId: n.postId, actorSlug: n.actor?.expertProfile?.slug }),
    createdAt: n.createdAt.toISOString(),
    read: !!n.readAt,
    actor: n.actor
      ? { name: n.actor.name, avatarUrl: n.actor.avatarUrl, avatarColor: n.actor.avatarColor, avatarIcon: n.actor.avatarIcon }
      : null,
  }));
}