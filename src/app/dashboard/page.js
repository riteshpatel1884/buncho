import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import DifficultyBadge from '@/components/DifficultyBadge';
import ActivityGrid from '@/components/ActivityGrid';
import { StatsCard } from '@/components/StatsCard';
import { getUserStats } from '@/lib/problems';
import { Flame } from '@/components/icons';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const user = await getOrCreateUser();
  if (!user) redirect('/login');

  const [topics, progress, bookmarks, suggestions, savedAnswers] = await Promise.all([
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
    prisma.problem.findMany({
      where: { published: true, progress: { none: { userId: user.id } } },
      orderBy: [{ difficulty: 'asc' }, { position: 'asc' }],
      take: 3,
      select: { slug: true, title: true, difficulty: true, topic: { select: { name: true } } },
    }),
    // Phase 3: community answers this user saved (hidden or unshared answers are left out)
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
  ]);

  const stats = await getUserStats(user.id);
  const completed = progress.filter((p) => p.status === 'COMPLETED');
  const inProgress = progress.filter((p) => p.status === 'ATTEMPTED').slice(0, 5);
  const completedByTopic = {};
  completed.forEach((p) => {
    completedByTopic[p.problem.topicId] = (completedByTopic[p.problem.topicId] ?? 0) + 1;
  });

  const firstName = user.name?.split(' ')[0];

  const Card = ({ id, title, children }) => (
    <section aria-labelledby={id} className="panel p-5">
      <h2 id={id} className="mb-3 text-base font-semibold">{title}</h2>
      {children}
    </section>
  );

  const List = ({ items, empty }) =>
    items.length ? (
      <ul className="-mx-2 space-y-0.5">
        {items.map((item) => (
          <li key={item.slug}>
            <Link href={`/problems/${item.slug}`} className="flex items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-sm odd:bg-surface-2/70 hover:bg-surface-2">
              <span className="min-w-0 truncate font-medium">{item.title}</span>
              <DifficultyBadge difficulty={item.difficulty} plain />
            </Link>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-muted">{empty}</p>
    );

  return (
    <div className="mx-auto w-full max-w-[96rem] px-4 py-6">
      <div className="grid gap-4 lg:grid-cols-[22rem_minmax(0,1fr)]">
        {/* Left column: profile, progress ring, activity */}
        <aside className="space-y-4">
          <section className="panel flex items-center gap-4 p-5">
            {user.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.imageUrl} alt="" width={56} height={56} className="h-14 w-14 rounded-lg object-cover" />
            ) : (
              <span className="grid h-14 w-14 place-items-center rounded-lg bg-accent-soft text-xl font-semibold text-accent">
                {(user.name ?? '?').charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold tracking-tight">{firstName ? `Welcome back, ${firstName}` : 'Welcome back'}</h1>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
                <Flame width={15} height={15} className={stats.streak ? 'text-accent' : ''} />
                {stats.streak} day streak
              </p>
            </div>
          </section>

          <StatsCard stats={stats} signedIn />
          <ActivityGrid stats={stats} />

          <dl className="panel grid grid-cols-3 divide-x divide-line p-0 text-center">
            {[['Attempted', progress.length], ['Completed', completed.length], ['Saved', bookmarks.length]].map(([label, value]) => (
              <div key={label} className="px-2 py-3">
                <dd className="text-lg font-semibold">{value}</dd>
                <dt className="text-xs text-muted">{label}</dt>
              </div>
            ))}
          </dl>
        </aside>

        {/* Right column */}
        <div className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-2">
            <Card id="continue" title="Continue where you left off">
              <List items={inProgress.map((p) => p.problem)} empty="Nothing in progress. Pick a problem below to get started." />
            </Card>
            <Card id="next" title="Try next">
              <List items={suggestions} empty="You've started every available problem. New ones are added regularly." />
            </Card>
          </div>

          <Card id="progress" title="Progress by topic">
            <ul className="grid gap-x-10 gap-y-4 md:grid-cols-2">
              {topics.map((t) => {
                const done = completedByTopic[t.id] ?? 0;
                const count = t._count.problems;
                const pct = count ? Math.round((done / count) * 100) : 0;
                return (
                  <li key={t.id}>
                    <div className="flex justify-between gap-4 text-sm">
                      <Link href={`/topics/${t.slug}`} className="font-medium hover:text-accent">{t.name}</Link>
                      <span className="text-muted">{done} of {count}</span>
                    </div>
                    <div
                      className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2"
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
          </Card>

          <Card id="saved" title="Saved for later">
            <List items={bookmarks.map((b) => b.problem)} empty="Use Save for later on any problem to collect it here." />
          </Card>

          <Card id="saved-answers" title="Saved community answers">
            {savedAnswers.length ? (
              <ul className="-mx-2 space-y-0.5">
                {savedAnswers.map(({ answer }) => (
                  <li key={answer.id}>
                    <Link
                      href={`/problems/${answer.problem.slug}#answer-${answer.id}`}
                      className="flex items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-sm odd:bg-surface-2/70 hover:bg-surface-2"
                    >
                      <span className="min-w-0 truncate font-medium">{answer.problem.title}</span>
                      <span className="shrink-0 text-xs text-muted">
                        {answer.anonymous ? 'Anonymous learner' : answer.user.name?.split(' ')[0] ?? 'A learner'}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">Use Save on a community answer to collect it here.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}