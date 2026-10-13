import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/user";
import { listNotifications } from "@/lib/notifications";
import NotificationRow from "@/components/NotificationRow";
import PushOptIn from "@/components/PushOptIn";

export const dynamic = "force-dynamic";
export const metadata = { title: "Notifications | buncho" };

export default async function NotificationsPage() {
  const me = await requireUser("/notifications");
  const items = await listNotifications(me.id, 50);

  // Mark everything read now. The list above was read first, so new ones still show their tint on this visit.
  if (items.some((n) => !n.read)) {
    await prisma.notification.updateMany({ where: { userId: me.id, readAt: null }, data: { readAt: new Date() } }).catch(() => {});
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="font-display text-2xl">Notifications</h1>

      <PushOptIn />

      {items.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8zM10 20a2 2 0 0 0 4 0" /></svg>
          </span>
          <p className="mt-4 font-display text-xl">Nothing yet</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">When someone follows you, likes or comments on your post, replies to your comment or mentions you, it shows up here.</p>
        </div>
      ) : (
        <ul className="card divide-y divide-line overflow-hidden">
          {items.map((n) => <NotificationRow key={n.id} n={n} />)}
        </ul>
      )}
    </div>
  );
}