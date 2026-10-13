"use server";
import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/user";
import { listNotifications } from "@/lib/notifications";

// Number in the bell. 0 when signed out.
export async function getUnreadCount() {
  const me = await getDbUser().catch(() => null);
  if (!me) return 0;
  return prisma.notification.count({ where: { userId: me.id, readAt: null } }).catch(() => 0);
}

// The latest few for the bell's drop-down.
export async function loadNotifications(limit = 12) {
  const me = await getDbUser().catch(() => null);
  if (!me) return [];
  return listNotifications(me.id, Math.min(Math.max(Number(limit) || 12, 1), 50));
}

export async function markAllRead() {
  const me = await getDbUser().catch(() => null);
  if (!me) return { ok: false };
  await prisma.notification.updateMany({ where: { userId: me.id, readAt: null }, data: { readAt: new Date() } });
  return { ok: true };
}

// ---------- Browser push ----------
// Called from the "Turn on push notifications" button, after the person allowed it in the browser.
export async function savePushSubscription(sub) {
  const me = await getDbUser().catch(() => null);
  if (!me) return { error: "Sign in to do that." };
  const endpoint = String(sub?.endpoint || "");
  const p256dh = String(sub?.keys?.p256dh || "");
  const auth = String(sub?.keys?.auth || "");
  if (!endpoint.startsWith("https://") || !p256dh || !auth) return { error: "That browser couldn't be subscribed." };

  // One row per browser. If someone else signed in on the same browser before, it moves to this account.
  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { userId: me.id, endpoint, p256dh, auth },
    update: { userId: me.id, p256dh, auth },
  });
  return { ok: true };
}

export async function removePushSubscription(endpoint) {
  const me = await getDbUser().catch(() => null);
  if (!me) return { ok: false };
  await prisma.pushSubscription.deleteMany({ where: { endpoint: String(endpoint || ""), userId: me.id } });
  return { ok: true };
}