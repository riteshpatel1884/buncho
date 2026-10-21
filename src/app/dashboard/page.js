import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import DifficultyBadge from '@/components/DifficultyBadge';
import ActivityGrid from '@/components/ActivityGrid';
import ReadinessCard from '@/components/ReadinessCard';
import WeeklyActivity from '@/components/WeeklyActivity';
import { Recommended, RevisionQueue, WeakTopics } from '@/components/InsightLists';
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

  const [topics, progress, bookmarks, savedAnswers, stats, insights, jobs] = await Promise.all([
    prisma.topic.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { problems: { where: { published: true } } } } },
    }),
    prisma.problemProgress.findMany({
      where: { userId: user.id },
      orderBy: { lastActivityAt: 'desc' },
      include: { problem: { select: { slug: true, title: true, difficulty: true, topicId: true } } },
    }),
    prisma.bookmark.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { problem: { select: { slug: true, title: true, difficulty: true } } },
    }),
    // Community answers this user saved (hidden or unshared answers are left out)
    prisma.answerBookmark.findMany({
      where: { userId: user.id, answer: { status: 'PUBLISHED' } },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        answer: {
          select: {
            id: true,
            anonymous: true,
            user: { select: { name: true } },
            problem: { select: { slug: true, title: true } },
          },
        },
      },
    }),
    getUserStats(user.id),
    getInsights(user.id),
    listJobs(user.id),
  ]);

  const completed = progress.filter((p) => p.status === 'COMPLETED');
  const inProgress = progress.filter((p) => p.status === 'ATTEMPTED').slice(0, 5);
  const completedByTopic = {};
  completed.forEach((p) => {
    completedByTopic[p.problem.topicId] = (completedByTopic[p.problem.topicId] ?? 0) + 1;
  });

  const firstName = user.name?.split(' ')[0];
  const resume = inProgress[0]?.problem;

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
            href={resume ? `/problems/${resume.slug}` : '/problems'}
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90"
          >
            {resume ? 'Resume practice' : 'Start practicing'}
          </Link>
        </div>
      </header>

      {/* Key numbers */}
      <dl className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        <StatTile label="Solved" value={stats.solved} sub={`of ${stats.total} problems`} accent />
        <StatTile label="Attempted" value={progress.length} sub={`${stats.attempted} in progress`} />
        <StatTile label="Day streak" value={stats.streak} sub={stats.streak ? 'Keep it going' : 'Practice today to start one'} />
        <StatTile label="Saved" value={bookmarks.length} sub="for later" />
      </dl>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
        {/* Main column */}
        <div className="min-w-0 space-y-8">
          <ReadinessCard readiness={insights.readiness} competencies={insights.competencies} />

          <div className="grid gap-8 xl:grid-cols-2">
            <Recommended items={insights.recommendations} />
            <RevisionQueue items={insights.revision} />
          </div>

          <div className="grid gap-8 xl:grid-cols-2">
            <WeakTopics items={insights.weakTopics} />
            <Section id="continue" title="Continue where you left off">
              <List items={inProgress.map((p) => p.problem)} empty="Nothing in progress. Pick a problem to get started." />
            </Section>
          </div>

          <Section id="progress" title="Progress by topic" hint="Problems completed in each topic.">
            <ul className="grid gap-x-12 gap-y-6 md:grid-cols-2">
              {topics.map((t) => {
                const done = completedByTopic[t.id] ?? 0;
                const count = t._count.problems;
                const pct = count ? Math.round((done / count) * 100) : 0;
                return (
                  <li key={t.id}>
                    <div className="flex justify-between gap-4 text-sm">
                      <Link href={`/topics/${t.slug}`} className="font-medium hover:text-accent">{t.name}</Link>
                      <span className="shrink-0 text-muted">{done} of {count}</span>
                    </div>
                    <div
                      className="mt-2.5 h-2 overflow-hidden rounded-full bg-surface-2"
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${t.name} completion`}
                    >
                      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Section>
        </div>

        {/* Sidebar */}
        <aside className="min-w-0 space-y-8">
          <StatsCard stats={stats} signedIn roomy />
          <WeeklyActivity weekly={insights.weekly} />
          <ActivityGrid stats={stats} roomy />
          <JobPrepCard jobs={jobs.slice(0, 3)} />

          <Section id="saved" title="Saved for later">
            <List items={bookmarks.map((b) => b.problem)} empty="Use Save for later on any problem to collect it here." />
          </Section>

          <Section id="saved-answers" title="Saved community answers">
            {savedAnswers.length ? (
              <ul className="-mx-3 space-y-1">
                {savedAnswers.map(({ answer }) => (
                  <li key={answer.id}>
                    <Link href={`/problems/${answer.problem.slug}#answer-${answer.id}`} className={rowClass}>
                      <span className="min-w-0 truncate font-medium">{answer.problem.title}</span>
                      <span className="shrink-0 text-xs text-muted">
                        {answer.anonymous ? 'Anonymous learner' : answer.user.name?.split(' ')[0] ?? 'A learner'}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>Use Save on a community answer to collect it here.</Empty>
            )}
          </Section>
        </aside>
      </div>
    </div>
  );
}