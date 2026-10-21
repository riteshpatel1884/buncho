import { Suspense } from 'react';
import ProblemFilters from '@/components/ProblemFilters';
import ProblemList from '@/components/ProblemList';
import { getProblems, getProgressMap, getTopics, parseFilters } from '@/lib/problems';
import { getOrCreateUser } from '@/lib/user';

export const metadata = { title: 'Production challenges' };

export default async function ChallengesPage({ searchParams }) {
  const filters = { ...parseFilters(await searchParams), challenge: true };
  const user = await getOrCreateUser();
  const [topics, result] = await Promise.all([getTopics(), getProblems(filters)]);
  const statusMap = user ? await getProgressMap(user.id, result.items.map((p) => p.id)) : {};

  const { page, challenge, ...rest } = filters;
  const params = Object.fromEntries(Object.entries(rest).filter(([, v]) => v));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">Production AI engineering</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Challenges</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Realistic incidents with logs and data. Diagnose the failure, explain your decisions step by step, and get feedback
          checked against a rubric. These test practical reasoning, not memorisation.
        </p>
      </header>

      <div className="mt-8">
        <Suspense fallback={<div className="h-24" />}>
          <ProblemFilters topics={topics} total={result.total} />
        </Suspense>
      </div>

      <div className="mt-4">
        <ProblemList result={result} statusMap={statusMap} basePath="/challenges" params={params} />
      </div>
    </div>
  );
}