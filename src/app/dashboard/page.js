import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import DifficultyBadge from '@/components/DifficultyBadge';

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

  const completed = progress.filter((p) => p.status === 'COMPLETED');
  const inProgress = progress.filter((p) => p.status === 'ATTEMPTED').slice(0, 5);
  const total = topics.reduce((sum, t) => sum + t._count.problems, 0);
  const completedByTopic = {};
  completed.forEach((p) => {
    completedByTopic[p.problem.topicId] = (completedByTopic[p.problem.topicId] ?? 0) + 1;
  });

  const stats = [
    { label: 'Attempted', value: progress.length },
    { label: 'Completed', value: completed.length },
    { label: 'Bookmarked', value: bookmarks.length },
    { label: 'Available', value: total },
  ];
  const firstName = user.name?.split(' ')[0];

  const List = ({ items, empty }) =>
    items.length ? (
      <ul className="divide-y divide-line border-y border-line">
        {items.map((item) => (
          <li key={item.slug}>
            <Link href={`/problems/${item.slug}`} className="flex items-center justify-between gap-4 py-3.5 hover:text-accent">
              <span className="font-medium">{item.title}</span>
              <DifficultyBadge difficulty={item.difficulty} />
            </Link>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-muted">{empty}</p>
    );

  return (
    <div className="wrap py-10 lg:py-14">
      <h1 className="text-2xl font-semibold tracking-tight">
        {firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
      </h1>

      <dl className="mt-8 grid grid-cols-2 gap-y-6 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="border-l-2 border-ink pl-4">
            <dd className="text-2xl font-semibold">{s.value}</dd>
            <dt className="text-sm text-muted">{s.label}</dt>
          </div>
        ))}
      </dl>

      <div className="mt-14 grid gap-12 lg:grid-cols-2">
        <section aria-labelledby="continue">
          <h2 id="continue" className="mb-3 font-display text-2xl font-semibold">Continue where you left off</h2>
          <List
            items={inProgress.map((p) => p.problem)}
            empty="Nothing in progress. Pick a problem below to get started."
          />
        </section>

        <section aria-labelledby="next">
          <h2 id="next" className="mb-3 font-display text-2xl font-semibold">Try next</h2>
          <List items={suggestions} empty="You've started every available problem. New ones are added regularly." />
        </section>

        <section aria-labelledby="progress" className="lg:col-span-2">
          <h2 id="progress" className="mb-4 font-display text-2xl font-semibold">Progress by topic</h2>
          <ul className="grid gap-x-12 gap-y-5 md:grid-cols-2">
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
        </section>

        <section aria-labelledby="saved" className="lg:col-span-2">
          <h2 id="saved" className="mb-3 font-display text-2xl font-semibold">Saved for later</h2>
          <List
            items={bookmarks.map((b) => b.problem)}
            empty="Use Save for later on any problem to collect it here."
          />
        </section>

        <section aria-labelledby="saved-answers" className="lg:col-span-2">
          <h2 id="saved-answers" className="mb-3 font-display text-2xl font-semibold">Saved community answers</h2>
          {savedAnswers.length ? (
            <ul className="divide-y divide-line border-y border-line">
              {savedAnswers.map(({ answer }) => (
                <li key={answer.id}>
                  <Link
                    href={`/problems/${answer.problem.slug}#answer-${answer.id}`}
                    className="flex items-center justify-between gap-4 py-3.5 hover:text-accent"
                  >
                    <span className="font-medium">{answer.problem.title}</span>
                    <span className="text-sm text-muted">
                      {answer.anonymous ? 'Anonymous learner' : answer.user.name?.split(' ')[0] ?? 'A learner'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">Use Save on a community answer to collect it here.</p>
          )}
        </section>
      </div>
    </div>
  );
}