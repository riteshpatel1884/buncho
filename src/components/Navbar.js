import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { isAdmin, getDbUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import Logo from "./Logo";
import NavShell from "./NavShell";
import MobileMenu from "./MobileMenu";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";
import NotificationBell from "./NotificationBell";
import { isBlueTick } from "./Badges";
import { REVIEW_WHERE, REPLY_OPEN, REFUND_OPEN, REQUEST_OPEN, PAYOUT_DUE, REPORT_OPEN } from "@/lib/review";

// Unread notifications for the bell. Never breaks the navbar if the table isn't there yet.
async function unreadCount(userId) {
  try {
    return await prisma.notification.count({ where: { userId, readAt: null } });
  } catch {
    return 0;
  }
}

export default async function Navbar() {
  const admin = await isAdmin();

  // Experts get a link to their own public profile (/experts/their-slug).
  const me = await getDbUser().catch(() => null);
  const myProfile =
    me?.role === "EXPERT"
      ? await prisma.expertProfile.findUnique({ where: { userId: me.id }, select: { slug: true, blueTickUntil: true } }).catch(() => null)
      : null;
  // Experts don't need "Find experts" or "Become an expert". Students don't need "Become an expert".
  const showFind = me?.role !== "EXPERT";
  const showBecome = !me?.role;
  // Experts and normal users can buy the blue tick, but the link only shows while they don't have an active one.
  // Experts keep their tick on the expert profile, everyone else on the account.
  const tickUntil = me?.role === "EXPERT" ? myProfile?.blueTickUntil : me?.blueTickUntil;
  const showTick = (me?.role === "EXPERT" || me?.role === "STUDENT") && !isBlueTick({ blueTickUntil: tickUntil });
  const profileHref = myProfile ? `/experts/${myProfile.slug}` : null;
  const unread = me ? await unreadCount(me.id) : 0;

  const [toReview, repliesOpen, refundsOpen, requestsOpen, payoutsDue, reportsOpen] = admin
    ? await Promise.all([
        prisma.expertProfile.count({ where: REVIEW_WHERE }).catch(() => 0),
        prisma.bookingReply.count({ where: REPLY_OPEN }).catch(() => 0),
        prisma.booking.count({ where: REFUND_OPEN }).catch(() => 0),
        prisma.booking.count({ where: REQUEST_OPEN }).catch(() => 0),
        prisma.booking.count({ where: PAYOUT_DUE }).catch(() => 0),
        prisma.report.count({ where: REPORT_OPEN }).catch(() => 0),
      ])
    : [0, 0, 0, 0, 0, 0];
  const waiting = toReview + repliesOpen + refundsOpen + requestsOpen + payoutsDue + reportsOpen;

  const adminBadge = waiting > 0 && (
    <span className="ml-1.5 rounded-full bg-brand px-1.5 py-0.5 text-[11px] font-bold text-on-brand">{waiting}</span>
  );
  const item = "block rounded-lg px-3 py-3 text-base font-medium hover:bg-surface-2";
  const link = "hidden text-muted transition-colors hover:text-ink md:block";

  return (
    <NavShell>
      <div className="flex items-center gap-6 sm:gap-10">
        <Link href="/" aria-label="Buncho home"><Logo /></Link>
        <div className="hidden items-center gap-7 text-sm font-medium md:flex">
          <Link href="/feed" className="text-muted transition-colors hover:text-ink">Feed</Link>
          <Link href="/projects" className="text-muted transition-colors hover:text-ink">Collab</Link>
          {showFind && <Link href="/experts" className="text-muted transition-colors hover:text-ink">Find experts</Link>}
          {showBecome && <Link href="/onboarding/expert" className="text-muted transition-colors hover:text-ink">Become an expert</Link>}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm font-medium sm:gap-4">
        <ThemeToggle />
        <Show when="signed-in">
          {me && <NotificationBell initialCount={unread} />}
          <Link href="/dashboard" className={link}>Dashboard</Link>
          {profileHref && <Link href={profileHref} className={link}>My profile</Link>}
          {showTick && <Link href="/dashboard/verification" className={link}>Blue tick</Link>}
          {admin && <Link href="/admin" className={link}>Admin{adminBadge}</Link>}
          <div className="hidden md:block"><UserMenu /></div>
        </Show>
        <Show when="signed-out">
          <Link href="/sign-in" className={link}>Sign in</Link>
        </Show>

        <MobileMenu>
          <div className="flex flex-col">
            <Link href="/feed" className={item}>Feed</Link>
            <Link href="/projects" className={item}>Collab</Link>
            {showFind && <Link href="/experts" className={item}>Find experts</Link>}
            {showBecome && <Link href="/onboarding/expert" className={item}>Become an expert</Link>}
            <Show when="signed-in">
              <Link href="/dashboard" className={item}>Dashboard</Link>
              {profileHref && <Link href={profileHref} className={item}>My profile</Link>}
              {showTick && <Link href="/dashboard/verification" className={item}>Blue tick</Link>}
              {admin && <Link href="/admin" className={item}>Admin{adminBadge}</Link>}
              <div className="mt-1 border-t border-line px-3 pb-1 pt-3">
                <UserMenu showName />
              </div>
            </Show>
            <Show when="signed-out">
              <Link href="/sign-in" className={item}>Sign in</Link>
            </Show>
          </div>
        </MobileMenu>
      </div>
    </NavShell>
  );
}