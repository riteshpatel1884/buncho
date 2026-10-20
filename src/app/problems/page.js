import { Suspense } from 'react';
import Banners from '@/components/Banners';
import LibraryLayout from '@/components/LibraryLayout';
import ProblemFilters from '@/components/ProblemFilters';
import ProblemList from '@/components/ProblemList';
import ActivityGrid from '@/components/ActivityGrid';
import { ContinueCard, StatsCard } from '@/components/StatsCard';
import { getProblems, getProgressMap, getTopics, getUserStats, parseFilters } from '@/lib/problems';
import { getOrCreateUser } from '@/lib/user';

export const metadata = { title: 'Problems' };

export default async function ProblemsPage({ searchParams }) {
  const filters = parseFilters(await searchParams);
  const user = await getOrCreateUser();
  const [topics, result, stats] = await Promise.all([getTopics(), getProblems(filters), getUserStats(user?.id ?? null)]);
  const statusMap = user ? await getProgressMap(user.id, result.items.map((p) => p.id)) : {};

  const { page, ...rest } = filters;
  const params = Object.fromEntries(Object.entries(rest).filter(([, v]) => v));

  const rail = (
    <>
      <StatsCard stats={stats} signedIn={Boolean(user)} />
      <ContinueCard stats={stats} />
      {user && <ActivityGrid stats={stats} />}
    </>
  );

  return (
    <LibraryLayout topics={topics} rail={rail}>
      <h1 className="sr-only">Problems</h1>
      <div className="space-y-5">
        <Banners signedIn={Boolean(user)} />

        <Suspense fallback={null}>
          <ProblemFilters topics={topics} solved={user ? stats.solved : null} total={user ? stats.total : result.total} />
        </Suspense>

        <ProblemList result={result} statusMap={statusMap} basePath="/problems" params={params} />
      </div>
    </LibraryLayout>
  );
}