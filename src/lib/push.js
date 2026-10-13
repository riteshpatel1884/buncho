import webpush from "web-push";
import { prisma } from "@/lib/prisma";

// Browser push. Needs three environment variables (see the setup notes):
// NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY and VAPID_SUBJECT (for example mailto:you@example.com).
// When they are missing, push is simply switched off and in-app notifications keep working.
let ready;
function configure() {
  if (ready !== undefined) return ready;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!pub || !priv || !subject) return (ready = false);
  webpush.setVapidDetails(subject, pub, priv);
  return (ready = true);
}

// Sends one push to every browser/device this person turned push on for.
// Never throws: a failed push must not break the action that caused it.
export async function sendPush(userId, { title, body, url, tag }) {
  try {
    if (!configure()) return;
    const subs = await prisma.pushSubscription.findMany({ where: { userId } });
    const payload = JSON.stringify({ title, body, url, tag });
    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 60 * 60 });
        } catch (err) {
          // 404 / 410 mean the browser has unsubscribed, so forget it.
          if (err?.statusCode === 404 || err?.statusCode === 410) await prisma.pushSubscription.deleteMany({ where: { endpoint: s.endpoint } });
        }
      })
    );
  } catch (err) {
    console.error("push failed", err);
  }
}