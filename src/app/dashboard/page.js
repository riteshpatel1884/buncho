import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import ReadinessCard from '@/components/ReadinessCard';
import WeeklyActivity from '@/components/WeeklyActivity';
import { StatsCard } from '@/components/StatsCard';
import { getUserStats } from '@/lib/problems';
import { getInsights } from '@/lib/insights';
import { attachInsights, getEntitlements } from '@/lib/subscription';
import PlanCard from '@/components/billing/PlanCard';
import ProBanner from '@/components/ProBanner';
import { listJobs } from '@/lib/jobs/progress';
import JobPrepCard from '@/components/jobs/JobPrepCard';
import StatTile from '@/components/dashboard/StatTile';
import Greeting from '@/components/dashboard/Greeting';
import SavedCard from '@/components/dashboard/SavedCard';

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
  const next = insights.recommendations[0];
  const completion = stats.total ? Math.round((stats.solved / stats.total) * 100) : 0;

  const avatarRing = pro ? 'rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 p-[3px] shadow-md shadow-amber-500/30' : '';

  return (
    <div className="relative mx-auto w-full max-w-[80rem] overflow-x-clip px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {pro && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-gradient-to-b from-amber-400/15 via-amber-300/5 to-transparent"
        />
      )}

      {/* Header */}
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
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
        <div className="flex shrink-0 flex-wrap gap-3">
          <Link href="/problems" className="rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-surface-2">
            Browse problems
          </Link>
          <Link
            href={next ? `/problems/${next.slug}` : '/problems'}
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90"
          >
            {next ? 'Next problem' : 'Start practicing'}
          </Link>
        </div>
      </header>

      {pro && (
        <div className="mt-6">
          <ProBanner periodEnd={ent.periodEnd} />
        </div>
      )}

      {/* Key numbers */}
      <dl className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        <StatTile label="Solved" value={stats.solved} sub={`of ${stats.total} problems`} accent />
        <StatTile label="Day streak" value={stats.streak} sub={stats.streak ? 'Keep it going' : 'Practice today to start one'} />
        <StatTile label="Completion" value={`${completion}%`} sub="of the question bank" />
        <StatTile label="Saved" value={bookmarks.length} sub="for later" />
      </dl>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
        {/* Main column */}
        <div className="min-w-0 space-y-8">
          <StatsCard stats={stats} signedIn roomy />
          <ReadinessCard readiness={insights.readiness} competencies={insights.competencies} />
        </div>

        {/* Sidebar */}
        <aside className="min-w-0 space-y-8">
          {/* Pro members see their plan in the "Plan details" popup on the banner above */}
          {!pro && <PlanCard ent={ent} />}
          <WeeklyActivity weekly={insights.weekly} />
          <JobPrepCard jobs={jobs.slice(0, 3)} />
          <SavedCard items={savedList} pro={pro} />
        </aside>
      </div>
    </div>
  );
}