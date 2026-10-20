import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import HeroDemo from '@/components/HeroDemo';
import { Flame, Flask, Mic, Users } from '@/components/icons';
import { getTopics } from '@/lib/problems';

const FEATURES = [
  {
    icon: Mic,
    title: 'Speak or type',
    body: 'Press the mic and talk your answer through, or write it. Long, real-world scenarios are easier to explain out loud.',
  },
  {
    icon: Flask,
    title: 'Expert reference',
    body: 'Submit an attempt and the expert solution unlocks, with the equations, code and trade-offs you may have missed.',
  },
  {
    icon: Users,
    title: 'Community answers',
    body: 'Read how other learners answered the same question, upvote what helped, and share your own anonymously.',
  },
  {
    icon: Flame,
    title: 'Streaks and progress',
    body: 'Rings, streaks and an activity grid show what you have covered, so practising a little every day sticks.',
  },
];

const STEPS = [
  ['1', 'Pick a problem', 'Browse by topic, difficulty or type from the problem list.'],
  ['2', 'Answer it first', 'Use the two-pane workspace: problem on the left, your answer on the right.'],
  ['3', 'Compare and learn', 'Unlock the reference solution and the community answers, then mark it complete.'],
];

export default async function LandingPage() {
  const { userId } = await auth();
  let topics = [];
  try {
    topics = await getTopics();
  } catch {
    // The landing page should still render if the database is unreachable
  }
  const totalProblems = topics.reduce((sum, t) => sum + t._count.problems, 0);

  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid w-full max-w-[96rem] items-center gap-10 px-4 py-12 lg:grid-cols-[1fr_1.15fr] lg:gap-14 lg:py-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
            <Flame width={14} height={14} /> Interview practice for AI, ML and GenAI roles
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Practice answering AI engineering questions out loud or in writing.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Answer first, then compare your thinking with an expert reference solution and with how other learners approached it.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/problems" className="rounded-md bg-accent px-6 py-3 font-semibold text-accent-ink hover:opacity-90">
              Start practicing
            </Link>
            <Link href={userId ? '/dashboard' : '/register'} className="rounded-md bg-surface-2 px-6 py-3 font-semibold hover:bg-line">
              {userId ? 'Open dashboard' : 'Create free account'}
            </Link>
          </div>

          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            {[
              [totalProblems || '100+', 'Problems'],
              [topics.length || '10+', 'Topics'],
              ['Voice + text', 'Answer modes'],
            ].map(([value, label]) => (
              <div key={label}>
                <dd className="text-2xl font-semibold">{value}</dd>
                <dt className="text-sm text-muted">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
        <HeroDemo />
      </section>

      {/* Topic chips */}
      {topics.length > 0 && (
        <section aria-label="Topics" className="mx-auto w-full max-w-[96rem] px-4">
          <ul className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {topics.map((t) => (
              <li key={t.id} className="shrink-0">
                <Link href={`/topics/${t.slug}`} className="inline-flex items-center gap-2 rounded-full bg-surface-2 px-4 py-1.5 text-sm font-medium text-muted transition-colors hover:text-ink">
                  {t.name}
                  <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-accent">{t._count.problems}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Features */}
      <section className="mx-auto w-full max-w-[96rem] px-4 py-14" aria-labelledby="features">
        <h2 id="features" className="text-2xl font-semibold tracking-tight">Everything you need to prepare</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <li key={title} className="panel p-5">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent-soft text-accent">
                <Icon width={20} height={20} />
              </span>
              <h3 className="mt-4 text-base font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-[96rem] px-4 pb-14" aria-labelledby="how">
        <h2 id="how" className="text-2xl font-semibold tracking-tight">How practice works</h2>
        <ol className="panel mt-6 grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
          {STEPS.map(([n, title, body]) => (
            <li key={n} className="flex gap-4 p-5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-ink">{n}</span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Topic cards */}
      {topics.length > 0 && (
        <section className="mx-auto w-full max-w-[96rem] px-4 pb-14" aria-labelledby="topics">
          <h2 id="topics" className="text-2xl font-semibold tracking-tight">Browse by topic</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((t) => (
              <li key={t.id}>
                <Link href={`/topics/${t.slug}`} className="panel group flex h-full items-start justify-between gap-4 p-4 transition-colors hover:border-accent">
                  <span>
                    <span className="block font-semibold group-hover:text-accent">{t.name}</span>
                    <span className="mt-1 block text-sm text-muted">{t.description}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-muted">{t._count.problems}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto w-full max-w-[96rem] px-4 pb-6">
        <div className="rounded-lg bg-gradient-to-br from-[#ffc01e] to-[#ff9d00] px-6 py-10 text-[#1a1a1a] sm:px-12">
          <h2 className="max-w-xl text-2xl font-semibold tracking-tight">Start with one question today.</h2>
          <p className="mt-2 max-w-lg text-[#1a1a1a]/75">It takes about ten minutes, and your first answer unlocks the expert solution.</p>
          <Link
            href={userId ? '/problems' : '/register'}
            className="mt-6 inline-flex rounded-md bg-[#1a1a1a] px-6 py-3 font-semibold text-white hover:opacity-90"
          >
            {userId ? 'Pick a problem' : 'Create free account'}
          </Link>
        </div>
      </section>
    </>
  );
}