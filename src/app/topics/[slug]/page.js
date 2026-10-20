import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import LibraryLayout from '@/components/LibraryLayout';
import ProblemFilters from '@/components/ProblemFilters';
import ProblemList from '@/components/ProblemList';
import ActivityGrid from '@/components/ActivityGrid';
import { ContinueCard, StatsCard } from '@/components/StatsCard';
import { getProblems, getProgressMap, getTopics, getUserStats, parseFilters } from '@/lib/problems';
import { getOrCreateUser } from '@/lib/user';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const topic = await prisma.topic.findUnique({ where: { slug }, select: { name: true } });
  return { title: topic?.name ?? 'Topic' };
}

export default async function TopicPage({ params, searchParams }) {
  const { slug } = await params;
  const topic = await prisma.topic.findUnique({ where: { slug } });
  if (!topic) notFound();

  const filters = { ...parseFilters(await searchParams), topic: slug };
  const user = await getOrCreateUser();
  const [allTopics, result, stats] = await Promise.all([getTopics(), getProblems(filters), getUserStats(user?.id ?? null)]);
  const statusMap = user ? await getProgressMap(user.id, result.items.map((p) => p.id)) : {};

  const { page, topic: _t, ...rest } = filters;
  const queryParams = Object.fromEntries(Object.entries(rest).filter(([, v]) => v));

  const rail = (
    <>
      <StatsCard stats={stats} signedIn={Boolean(user)} />
      <ContinueCard stats={stats} />
      {user && <ActivityGrid stats={stats} />}
    </>
  );

  return (
    <LibraryLayout topics={allTopics} rail={rail}>
      <div className="space-y-5">
        <header className="panel p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">Topic</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{topic.name}</h1>
          {topic.description && <p className="mt-1 max-w-2xl text-sm text-muted">{topic.description}</p>}
        </header>

        <Suspense fallback={null}>
          <ProblemFilters topics={allTopics} currentTopic={slug} total={result.total} />
        </Suspense>

        <ProblemList result={result} statusMap={statusMap} basePath={`/topics/${slug}`} params={queryParams} />
      </div>
    </LibraryLayout>
  );
}