import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import HeroDemo from '@/components/HeroDemo';
import Logo from '@/components/Logo';
import { Check, ChevronRight, Flame, Flask, Mic, Tag, Users } from '@/components/icons';
import { getTopics } from '@/lib/problems';
import JsonLd from '@/components/JsonLd';
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, buildMetadata, graph, organizationJsonLd, websiteJsonLd } from '@/lib/seo';

export const metadata = buildMetadata({
  absoluteTitle: `${SITE_NAME}: ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  path: '/',
});

const FAQ = [
  {
    q: 'What is Buncho?',
    a: 'Buncho is an interview practice platform for AI, machine learning and generative AI engineers. You answer real interview questions by speaking or typing, then compare your answer with a reference solution and AI feedback.',
  },
  {
    q: 'Which topics and question types are covered?',
    a: 'Topics include machine learning fundamentals, deep learning, generative AI and LLMs, RAG and vector databases, Python for AI and ML, and production AI engineering. Questions range from conceptual and practical exercises to debugging, system design and case studies.',
  },
  {
    q: 'Can I answer out loud instead of typing?',
    a: 'Yes. Use the microphone to dictate your answer, or type it. Explaining a long scenario out loud is closer to a real interview.',
  },
  {
    q: 'How does the AI feedback work?',
    a: 'After you submit an answer, it is scored against a rubric covering coverage, technical accuracy, reasoning depth and clarity. The reference solution unlocks at the same time so you can compare approaches.',
  },
  {
    q: 'Is Buncho free?',
    a: 'You can start practicing for free. Create a free account to save answers, track your streak and progress, and read community answers.',
  },
];

const STEPS = [
  { n: '01', title: 'Pick a problem', body: 'Browse by topic, difficulty or type from the problem list, or search for a concept.', time: 'About 1 min' },
  { n: '02', title: 'Answer it first', body: 'Use the two-pane workspace: the problem on the left, your spoken or written answer on the right.', time: '5 to 15 min' },
  { n: '03', title: 'Compare and learn', body: 'Unlock the expert solution and community answers, then mark the problem complete.', time: 'About 5 min' },
];

const WAVE = [0.1, 0.35, 0.2, 0.5, 0.05, 0.4, 0.25, 0.45, 0.15, 0.3, 0.2, 0.4];
const HEAT = Array.from({ length: 56 }, (_, i) => [0, 1, 0, 2, 3, 1, 0, 2, 1, 3, 0, 1, 2, 0][(i * 7) % 14]);
const HEAT_CLS = ['bg-surface', 'bg-accent/35', 'bg-accent/65', 'bg-accent'];

function SectionHeader({ eyebrow, title, body, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
        {body && <p className="mt-3 leading-relaxed text-muted">{body}</p>}
      </div>
      {action}
    </div>
  );
}

function IconTile({ icon: Icon }) {
  return (
    <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent transition-transform duration-300 group-hover:scale-105">
      <Icon width={22} height={22} />
    </span>
  );
}

const card =
  'panel group relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg hover:shadow-black/10';

export default async function LandingPage() {
  const { userId } = await auth();
  let topics = [];
  try {
    topics = await getTopics();
  } catch {
    // The landing page should still render if the database is unreachable
  }
  const totalProblems = topics.reduce((sum, t) => sum + t._count.problems, 0);

  const faqJsonLd = {
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <>
      <JsonLd data={graph(organizationJsonLd(), websiteJsonLd(), faqJsonLd)} />

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

      {/* Features: bento grid */}
      <section className="mx-auto w-full max-w-[96rem] px-4 py-20" aria-labelledby="features">
        <SectionHeader
          eyebrow="Features"
          title={<span id="features">Everything you need to prepare</span>}
          body="One focused workspace for answering, checking and remembering what you learn, so your practice time goes into thinking and not into tooling."
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {/* Speak or type */}
          <article className={`${card} lg:col-span-2`}>
            <IconTile icon={Mic} />
            <h3 className="mt-5 text-lg font-semibold">Speak or type your answer</h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Press the mic and talk your answer through, or write it. Long, real-world scenarios are far easier to explain out loud, just like in a real interview.
            </p>
            <div aria-hidden="true" className="mt-6 flex items-center gap-4 rounded-lg bg-surface-2 p-4">
              <span className="inline-flex items-center gap-2 rounded-md bg-hard px-3 py-1.5 text-xs font-semibold text-white">
                <span className="h-2 w-2 rounded-full bg-white" /> Dictating
              </span>
              <span className="flex h-6 items-center gap-[3px]">
                {WAVE.map((d, i) => (
                  <span key={i} className="wave-bar block h-5 w-[3px] rounded-full bg-hard" style={{ animationDelay: `${d}s` }} />
                ))}
              </span>
              <span className="ml-auto font-mono text-xs text-muted">00:42</span>
            </div>
          </article>

          {/* Expert reference */}
          <article className={card}>
            <IconTile icon={Flask} />
            <h3 className="mt-5 text-lg font-semibold">Expert reference</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Submit an attempt and the expert solution unlocks, with the equations, code and trade-offs you may have missed.
            </p>
            <div aria-hidden="true" className="mt-6 space-y-2 rounded-lg bg-surface-2 p-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-easy/12 px-2.5 py-0.5 text-xs font-semibold text-easy">
                <Check width={12} height={12} strokeWidth={2.6} /> Expert reviewed
              </span>
              <span className="block h-2 w-full rounded-full bg-line" />
              <span className="block h-2 w-5/6 rounded-full bg-line" />
              <span className="block h-2 w-2/3 rounded-full bg-line" />
            </div>
          </article>

          {/* Community */}
          <article className={card}>
            <IconTile icon={Users} />
            <h3 className="mt-5 text-lg font-semibold">Community answers</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Read how other learners answered the same question, upvote what helped, and share your own anonymously.
            </p>
            <div aria-hidden="true" className="mt-6 flex items-center justify-between rounded-lg bg-surface-2 p-4">
              <span className="flex -space-x-2">
                {['A', 'R', 'S', 'M'].map((c) => (
                  <span key={c} className="grid h-8 w-8 place-items-center rounded-full border-2 border-surface-2 bg-accent-soft text-xs font-semibold text-accent">
                    {c}
                  </span>
                ))}
              </span>
              <span className="rounded-md bg-surface px-2.5 py-1 text-xs font-semibold text-muted">Helpful &middot; 24</span>
            </div>
          </article>

          {/* Streaks */}
          <article className={`${card} lg:col-span-2`}>
            <IconTile icon={Flame} />
            <h3 className="mt-5 text-lg font-semibold">Streaks and progress</h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Progress rings, a daily streak and an activity grid show what you have covered, so practising a little every day actually sticks.
            </p>
            <div aria-hidden="true" className="mt-6 flex items-center gap-5 rounded-lg bg-surface-2 p-4">
              <div className="grid grid-flow-col grid-rows-4 gap-1.5">
                {HEAT.map((l, i) => (
                  <span key={i} className={`h-3.5 w-3.5 rounded-[3px] ${HEAT_CLS[l]}`} />
                ))}
              </div>
              <div className="ml-auto text-right">
                <p className="flex items-center justify-end gap-1.5 text-lg font-semibold">
                  <Flame width={18} height={18} className="text-accent" /> 7
                </p>
                <p className="text-xs text-muted">day streak</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-line bg-surface-2/50" aria-labelledby="how">
        <div className="mx-auto w-full max-w-[96rem] px-4 py-20">
          <SectionHeader
            eyebrow="How it works"
            title={<span id="how">Three steps, ten minutes a day</span>}
            body="A simple loop that mirrors a real interview: think, answer, then check yourself against the best version."
          />

          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="panel group p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-ink">
                    {s.n}
                  </span>
                  <span aria-hidden="true" className="hidden h-px flex-1 bg-gradient-to-r from-accent/60 to-transparent md:block" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
                <p className="mt-5 inline-flex rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-muted">{s.time}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Topics */}
      {topics.length > 0 && (
        <section className="mx-auto w-full max-w-[96rem] px-4 py-20" aria-labelledby="topics">
          <SectionHeader
            eyebrow="Topics"
            title={<span id="topics">Browse by topic</span>}
            body="From RAG and vector databases to evaluation and deployment, pick the area you want to sharpen next."
            action={
              <Link href="/problems" className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
                View all problems <ChevronRight width={16} height={16} />
              </Link>
            }
          />

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/topics/${t.slug}`}
                  className="panel group relative flex h-full flex-col overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg hover:shadow-black/10"
                >
                  <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100" />
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent-soft text-accent">
                      <Tag width={20} height={20} />
                    </span>
                    <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-muted">
                      {t._count.problems} {t._count.problems === 1 ? 'problem' : 'problems'}
                    </span>
                  </div>
                  <h3 className="mt-4 font-semibold group-hover:text-accent">{t.name}</h3>
                  <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">{t.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors group-hover:text-accent">
                    Explore topic
                    <ChevronRight width={16} height={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* FAQ */}
      <section className="mx-auto w-full max-w-[96rem] px-4 pb-20" aria-labelledby="faq">
        <SectionHeader
          eyebrow="FAQ"
          title={<span id="faq">Questions about AI interview practice</span>}
        />
        <div className="mt-8 max-w-3xl divide-y divide-line border-y border-line">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="cursor-pointer list-none font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {f.q}
                  <ChevronRight width={16} height={16} className="shrink-0 text-muted transition-transform duration-200 group-open:rotate-90" />
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-[96rem] px-4 pb-20 pt-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#34d67b] to-[#1fae5a] px-6 py-14 text-[#04140a] sm:px-14">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                'linear-gradient(#04140a 1px, transparent 1px), linear-gradient(90deg, #04140a 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              maskImage: 'linear-gradient(to left, black, transparent 70%)',
              WebkitMaskImage: 'linear-gradient(to left, black, transparent 70%)',
            }}
          />
          <div
            aria-hidden="true"
            className="absolute right-10 top-1/2 hidden -translate-y-1/2 drop-shadow-[0_20px_32px_rgba(4,20,10,0.25)] lg:block xl:right-16"
          >
            <Logo size="xl" tone="dark" />
          </div>

          <div className="relative max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#04140a]/70">Ready when you are</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Start with one question today.</h2>
            <p className="mt-3 max-w-lg text-[#04140a]/75">
              It takes about ten minutes, and your first answer unlocks the expert solution.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href={userId ? '/problems' : '/register'}
                className="inline-flex items-center gap-2 rounded-md bg-[#04140a] px-6 py-3 font-semibold text-[#34d67b] transition-opacity hover:opacity-90"
              >
                {userId ? 'Pick a problem' : 'Create free account'}
                <ChevronRight width={18} height={18} />
              </Link>
              <Link
                href="/problems"
                className="rounded-md border border-[#04140a]/30 px-6 py-3 font-semibold transition-colors hover:bg-[#04140a]/10"
              >
                Browse problems
              </Link>
            </div>
            <p className="mt-5 text-sm text-[#04140a]/65">Free to start. Voice and text answers included.</p>
          </div>
        </div>
      </section>
    </>
  );
}