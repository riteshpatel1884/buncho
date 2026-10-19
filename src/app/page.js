import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import HeroDemo from '@/components/HeroDemo';
import { getTopics } from '@/lib/problems';

export default async function LandingPage() {
  const { userId } = await auth();
  let topics = [];
  try {
    topics = await getTopics();
  } catch {
    // The landing page should still render if the database is unreachable
  }

  const steps = [
    {
      title: 'Attempt it first',
      body: 'Type your answer, or press the mic and talk it through. Long, real-world scenarios are much easier to explain out loud.',
    },
    {
      title: 'Unlock the reference',
      body: 'After you submit, the expert solution opens with the equations, code and trade-offs, so you can see what you covered and what you missed.',
    },
    {
      title: 'Keep track of what sticks',
      body: 'Bookmark questions to revisit and mark them completed. Your dashboard shows progress for every topic.',
    },
  ];

  return (
    <>
      <section className="wrap grid items-center gap-12 py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24">
        <div>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Practice answering AI engineering questions out loud or in writing.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            Buncho is a practice platform for AI Engineer, ML Engineer and GenAI Engineer interviews. Answer first, then
            compare your thinking with a reference solution.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/problems" className="rounded-md bg-accent px-6 py-3 font-semibold text-accent-ink">
              Browse problems
            </Link>
            <Link
              href={userId ? '/dashboard' : '/register'}
              className="rounded-md bg-surface-2 px-6 py-3 font-semibold hover:bg-line"
            >
              {userId ? 'Open dashboard' : 'Create free account'}
            </Link>
          </div>
        </div>
        <HeroDemo />
      </section>

      <section className="wrap py-14" aria-labelledby="how">
        <h2 id="how" className="text-2xl font-semibold tracking-tight">How practice works</h2>
        <ol className="mt-8 grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.title} className="panel p-5">
              <h3 className="font-display text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {topics.length > 0 && (
        <section className="wrap py-14" aria-labelledby="topics">
          <h2 id="topics" className="text-2xl font-semibold tracking-tight">Browse by topic</h2>
          <ul className="mt-8 grid gap-x-10 md:grid-cols-2">
            {topics.map((t) => (
              <li key={t.id} className="border-t border-line">
                <Link href={`/topics/${t.slug}`} className="group flex items-baseline justify-between gap-4 py-4">
                  <span>
                    <span className="block font-medium group-hover:text-accent">{t.name}</span>
                    <span className="mt-0.5 block text-sm text-muted">{t.description}</span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-muted">{t._count.problems}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="wrap py-14">
        <div className="panel px-6 py-12 sm:px-12">
          <h2 className="max-w-xl text-2xl font-semibold tracking-tight">
            Start with one question today.
          </h2>
          <p className="mt-3 max-w-lg text-muted">It takes about ten minutes, and your first answer unlocks the expert solution.</p>
          <Link
            href={userId ? '/problems' : '/register'}
            className="mt-6 inline-flex rounded-md bg-accent px-6 py-3 font-semibold text-accent-ink"
          >
            {userId ? 'Pick a problem' : 'Create free account'}
          </Link>
        </div>
      </section>
    </>
  );
}