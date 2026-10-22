import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import DifficultyBadge from '@/components/DifficultyBadge';
import ReadinessCard from '@/components/ReadinessCard';
import WeeklyActivity from '@/components/WeeklyActivity';
import { RevisionQueue } from '@/components/InsightLists';
import { StatsCard } from '@/components/StatsCard';
import { getUserStats } from '@/lib/problems';
import { getInsights } from '@/lib/insights';
import { listJobs } from '@/lib/jobs/progress';
import JobPrepCard from '@/components/jobs/JobPrepCard';
import Section, { Empty, rowClass } from '@/components/dashboard/Section';
import StatTile from '@/components/dashboard/StatTile';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const user = await getOrCreateUser();
  if (!user) redirect('/login');

  const [progress, bookmarks, stats, insights, jobs] = await Promise.all([
    prisma.problemProgress.findMany({
      where: { userId: user.id },
      orderBy: { lastActivityAt: 'desc' },
      include: { problem: { select: { slug: true, title: true, difficulty: true } } },
    }),
    prisma.bookmark.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { problem: { select: { slug: true, title: true, difficulty: true } } },
    }),
    getUserStats(user.id),
    getInsights(user.id),
    listJobs(user.id),
  ]);

  const completed = progress.filter((p) => p.status === 'COMPLETED');
  const recentlySolved = completed.slice(0, 5).map((p) => p.problem);

  const firstName = user.name?.split(' ')[0];
  const next = insights.recommendations[0];
  const completion = stats.total ? Math.round((stats.solved / stats.total) * 100) : 0;

  const List = ({ items, empty }) =>
    items.length ? (
      <ul className="-mx-3 space-y-1">
        {items.map((item) => (
          <li key={item.slug}>
            <Link href={`/problems/${item.slug}`} className={rowClass}>
              <span className="min-w-0 truncate font-medium">{item.title}</span>
              <DifficultyBadge difficulty={item.difficulty} plain />
            </Link>
          </li>
        ))}
      </ul>
    ) : (
      <Empty>{empty}</Empty>
    );

  return (
    <div className="mx-auto w-full max-w-[80rem] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          {user.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.imageUrl} alt="" width={56} height={56} className="h-14 w-14 shrink-0 rounded-full object-cover" />
          ) : (
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-accent-soft text-xl font-semibold text-accent">
              {(user.name ?? '?').charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
              {firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
            </h1>
            <p className="mt-1 text-sm text-muted">Here&rsquo;s where your interview prep stands today.</p>
          </div>
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
          <ReadinessCard readiness={insights.readiness} competencies={insights.competencies} />

          <div className="grid gap-8 xl:grid-cols-2">
            <RevisionQueue items={insights.revision} />
            <Section id="recent" title="Recently solved" hint="Problems you have submitted an answer for.">
              <List items={recentlySolved} empty="Submit an answer to solve your first problem." />
            </Section>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="min-w-0 space-y-8">
          <StatsCard stats={stats} signedIn roomy />
          <WeeklyActivity weekly={insights.weekly} />
          <JobPrepCard jobs={jobs.slice(0, 3)} />

          <Section id="saved" title="Saved for later">
            <List items={bookmarks.map((b) => b.problem)} empty="Use Save for later on any problem to collect it here." />
          </Section>
        </aside>
      </div>
    </div>
  );
}