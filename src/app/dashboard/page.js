import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import ReadinessCard from '@/components/ReadinessCard';
import { StatsCard } from '@/components/StatsCard';
import { getUserStats, dayKey } from '@/lib/problems';
import { getInsights } from '@/lib/insights';
import { attachInsights, getEntitlements } from '@/lib/subscription';
import PlanCard from '@/components/billing/PlanCard';
import ProBanner from '@/components/ProBanner';
import { listJobs } from '@/lib/jobs/progress';
import JobPrepCard from '@/components/jobs/JobPrepCard';
import StatTile from '@/components/dashboard/StatTile';
import Greeting from '@/components/dashboard/Greeting';
import SavedCard from '@/components/dashboard/SavedCard';
import ActivityChart from '@/components/dashboard/ActivityChart';
import StreakCalendar from '@/components/dashboard/StreakCalendar';
import ShareProfile from '@/components/profile/ShareProfile';
import { Check, Flame, Grid, Bookmark } from '@/components/icons';
import { SITE_URL } from '@/lib/seo';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const user = await getOrCreateUser();
  if (!user) redirect('/login');

  const ent = await getEntitlements(user.id);
  const pro = ent.isPro;

  const [bookmarks, stats, insights, jobs] = await Promise.all([
    prisma.bookmark.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 500,
      include: { problem: { select: { slug: true, title: true, difficulty: true } } },
    }),
    getUserStats(user.id),
    getInsights(user.id),
    listJobs(user.id),
  ]);

  const savedList = await attachInsights(bookmarks.map((b) => b.problem), pro);

  const firstName = user.name?.split(' ')[0];
  const completion = stats.total ? Math.round((stats.solved / stats.total) * 100) : 0;
  const todayKey = dayKey(new Date()); // YYYY-MM-DD in India time, same key format as stats.activeDays

  const avatarRing = pro
    ? 'rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 p-[3px] shadow-md shadow-amber-500/30'
    : 'rounded-full bg-gradient-to-br from-accent/60 to-accent/10 p-[3px]';

  return (
    <div className="relative mx-auto w-full max-w-[80rem] overflow-x-clip px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* soft glow behind the header */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-accent/10 via-accent/[0.03] to-transparent"
      />

      <div className="relative">
        {/* Header: greeting + Pro banner in ONE row (stacks on phones) */}
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
          <div className="flex min-w-0 shrink-0 items-center gap-4">
            <span className={`shrink-0 ${avatarRing}`}>
              {user.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.imageUrl} alt="" width={56} height={56} className="h-14 w-14 rounded-full object-cover" />
              ) : (
                <span className="grid h-14 w-14 place-items-center rounded-full bg-accent-soft text-xl font-semibold text-accent">
                  {(user.name ?? '?').charAt(0).toUpperCase()}
                </span>
              )}
            </span>
            <Greeting name={firstName} pro={pro} />
          </div>

          {pro && <ProBanner periodEnd={ent.periodEnd} className="min-w-0 lg:flex-1" />}
        </header>

        {/* Public profile: share + links (or a prompt to claim a username) */}
        {user.username ? (
          <div className="mt-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
            <p className="flex items-center gap-2 pt-2 text-sm">
              <Link href={`/user/${user.username}`} className="font-semibold text-accent hover:underline">
                View public profile
              </Link>
              <span className="text-muted" aria-hidden="true">·</span>
              <Link href="/settings/profile" className="font-medium text-muted hover:text-ink">
                Edit
              </Link>
            </p>
            <ShareProfile url={`${SITE_URL}/user/${user.username}`} name={user.profileName || firstName || 'my'} compact />
          </div>
        ) : (
          <Link
            href="/settings/profile"
            className="group mt-6 flex items-center justify-between gap-4 rounded-2xl border border-accent/40 bg-accent-soft px-5 py-4 transition hover:border-accent"
          >
            <span>
              <span className="block font-semibold">Claim your username and get a shareable profile</span>
              <span className="mt-0.5 block text-sm text-muted">Show your level, streak and badges at buncho.live/user/your-name.</span>
            </span>
            <span className="shrink-0 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-ink group-hover:opacity-90">Claim it</span>
          </Link>
        )}

        {/* Key numbers */}
        <dl className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          <StatTile label="Solved" value={stats.solved} sub={`of ${stats.total} problems`} accent icon={<Check width={16} height={16} />} />
          <StatTile
            label="Day streak"
            value={stats.streak}
            sub={stats.streak ? 'Keep it going' : 'Practice today to start one'}
            icon={<Flame width={16} height={16} />}
          />
          <StatTile label="Completion" value={`${completion}%`} sub="of the question bank" icon={<Grid width={16} height={16} />} />
          <StatTile label="Saved" value={bookmarks.length} sub="for later" icon={<Bookmark width={16} height={16} />} />
        </dl>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
          {/* Main column */}
          <div className="min-w-0 space-y-8">
            <ActivityChart activeDays={stats.activeDays} todayKey={todayKey} />
            <StatsCard stats={stats} signedIn roomy />
            <ReadinessCard readiness={insights.readiness} competencies={insights.competencies} />
          </div>

          {/* Sidebar */}
          <aside className="min-w-0 space-y-8">
            {/* Pro members see their plan in the "Plan details" popup on the banner above */}
            {!pro && <PlanCard ent={ent} />}
            <StreakCalendar activeDays={stats.activeDays} todayKey={todayKey} streak={stats.streak} />
            <JobPrepCard jobs={jobs.slice(0, 3)} />
            <SavedCard items={savedList} pro={pro} />
          </aside>
        </div>
      </div>
    </div>
  );
}