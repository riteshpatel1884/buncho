import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProblemFilters from '@/components/ProblemFilters';
import ProblemList from '@/components/ProblemList';
import { getProblems, getProgressMap, getTopics, parseFilters } from '@/lib/problems';
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
  const [allTopics, result, user] = await Promise.all([getTopics(), getProblems(filters), getOrCreateUser()]);
  const statusMap = user ? await getProgressMap(user.id, result.items.map((p) => p.id)) : {};

  const { page, topic: _t, ...rest } = filters;
  const queryParams = Object.fromEntries(Object.entries(rest).filter(([, v]) => v));

  return (
    <div className="wrap py-10 lg:py-14">
      <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Topics" className="hidden lg:block">
          <ul className="sticky top-24 space-y-1 text-sm">
            <li><Link href="/problems" className="block rounded-md px-3 py-2 text-muted hover:bg-surface-2">All problems</Link></li>
            {allTopics.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/topics/${t.slug}`}
                  aria-current={t.slug === slug ? 'page' : undefined}
                  className={`block rounded-md px-3 py-2 ${t.slug === slug ? 'bg-accent-soft font-semibold text-accent' : 'text-muted hover:bg-surface-2'}`}
                >
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">{topic.name}</h1>
          <p className="mt-2 max-w-2xl text-muted">{topic.description}</p>
          <div className="mt-8">
            <Suspense fallback={null}>
              <ProblemFilters hideTopic />
            </Suspense>
          </div>
          <div className="mt-8">
            <ProblemList result={result} statusMap={statusMap} basePath={`/topics/${slug}`} params={queryParams} />
          </div>
        </div>
      </div>
    </div>
  );
}
