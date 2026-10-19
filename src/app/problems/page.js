import { Suspense } from 'react';
import ProblemFilters from '@/components/ProblemFilters';
import ProblemList from '@/components/ProblemList';
import { getProblems, getProgressMap, getTopics, parseFilters } from '@/lib/problems';
import { getOrCreateUser } from '@/lib/user';

export const metadata = { title: 'Problems' };

export default async function ProblemsPage({ searchParams }) {
  const filters = parseFilters(await searchParams);
  const [topics, result, user] = await Promise.all([getTopics(), getProblems(filters), getOrCreateUser()]);
  const statusMap = user ? await getProgressMap(user.id, result.items.map((p) => p.id)) : {};

  const { page, ...rest } = filters;
  const params = Object.fromEntries(Object.entries(rest).filter(([, v]) => v));

  return (
    <div className="wrap py-10 lg:py-14">
      <h1 className="text-2xl font-semibold tracking-tight">Problems</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Interview questions for AI, ML and GenAI roles. Filter by topic, difficulty or type.
      </p>

      <div className="mt-8">
        <Suspense fallback={null}>
          <ProblemFilters topics={topics} />
        </Suspense>
      </div>

      <div className="mt-8">
        <ProblemList result={result} statusMap={statusMap} basePath="/problems" params={params} />
      </div>
    </div>
  );
}