import { Suspense } from 'react';
import Link from 'next/link';
import ProblemFilters from '@/components/ProblemFilters';
import ProblemList from '@/components/ProblemList';
import { NextUpCard, ProgressCard } from '@/components/ProblemStats';
import { getProblems, getProgressMap, getTopics, getUserStats, parseFilters } from '@/lib/problems';
import { getOrCreateUser } from '@/lib/user';
import { Bookmark } from '@/components/icons';

export const metadata = { title: 'Problems' };

export default async function ProblemsPage({ searchParams }) {
  const filters = parseFilters(await searchParams);
  const user = await getOrCreateUser();
  const [topics, result, stats] = await Promise.all([getTopics(), getProblems(filters), getUserStats(user?.id ?? null)]);
  const statusMap = user ? await getProgressMap(user.id, result.items.map((p) => p.id)) : {};

  const { page, ...rest } = filters;
  const params = Object.fromEntries(Object.entries(rest).filter(([, v]) => v));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Practice library</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Problems</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Curated AI, ML and GenAI interview questions. Answer in your own words, then get instant AI feedback.
          </p>
        </div>
        {user && (
          <Link
            href="/dashboard#saved"
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-muted"
          >
            <Bookmark width={16} height={16} /> Saved for later
          </Link>
        )}
      </header>

      <section aria-label="Your stats" className="mt-6 grid gap-4 md:grid-cols-[3fr_2fr]">
        <ProgressCard stats={stats} signedIn={Boolean(user)} />
        <NextUpCard stats={stats} signedIn={Boolean(user)} />
      </section>

      <div className="mt-8">
        <Suspense fallback={<div className="h-24" />}>
          <ProblemFilters topics={topics} solved={user ? stats.solved : null} total={user ? stats.total : result.total} />
        </Suspense>
      </div>

      <div className="mt-4">
        <ProblemList result={result} statusMap={statusMap} basePath="/problems" params={params} />
      </div>
    </div>
  );
}