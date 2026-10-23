import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { getCommunityAnswers } from '@/lib/community';
import { hashContent } from '@/lib/ai/evaluate';
import { DIFFICULTY_LABEL, TYPE_LABEL } from '@/lib/constants';
import Markdown from '@/components/Markdown';
import Hints from '@/components/Hints';
import DifficultyBadge from '@/components/DifficultyBadge';
import AnswerEditor from '@/components/AnswerEditor';
import ShareControl from '@/components/ShareControl';
import CommunitySection from '@/components/CommunitySection';
import BookmarkButton from '@/components/BookmarkButton';
import FeedbackView from '@/components/FeedbackView';
import FeedbackControls from '@/components/FeedbackControls';
import ProblemListPopup from '@/components/ProblemListPopup';
import { CompleteToggle, RevealButton } from '@/components/SolutionControls';
import ProblemTabs from '@/components/ProblemTabs';
import Workspace from '@/components/Workspace';
import Timer from '@/components/Timer';
import { getProblemNeighbors, getUpNext } from '@/lib/problems';
import JsonLd from '@/components/JsonLd';
import { buildMetadata, breadcrumbJsonLd, fitTitle, graph, plainText, problemJsonLd, truncate } from '@/lib/seo';

import { ChevronLeft, ChevronRight, Code, FileText, Flask, Lock, Users } from '@/components/icons';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await prisma.problem.findFirst({
    where: { slug, published: true },
    select: { title: true, description: true, difficulty: true, isChallenge: true, estimatedMinutes: true, topic: { select: { name: true } } },
  });
  if (!p) return { title: 'Problem not found', robots: { index: false, follow: false } };

  const kind = p.isChallenge ? 'production challenge' : `${p.topic.name} interview question`;
  const tail = ` Practice this ${DIFFICULTY_LABEL[p.difficulty].toLowerCase()} ${kind} with AI feedback.`;
  const body = plainText(p.description);
  const description = truncate(body, Math.max(60, 158 - tail.length)).replace(/([^.!?\u2026])$/, '$1.') + tail;

  return buildMetadata({
    title: fitTitle(p.title, p.isChallenge ? 'Production challenge' : `${p.topic.name} interview question`),
    description,
    path: `/problems/${slug}`,
    image: `/problems/${slug}/opengraph-image`,
    imageAlt: `${p.title} | Buncho`,
    type: 'article',
  });
}

const asArray = (v) => (Array.isArray(v) ? v : []);
// Four backticks so a log that contains ``` can't break out of the code block
const fence = (a) => `\`\`\`\`${a.kind === 'json' ? 'json' : 'text'}\n${a.content}\n\`\`\`\``;

export default async function ProblemPage({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const cpage = Math.max(1, parseInt(sp?.cpage, 10) || 1);

  const problem = await prisma.problem.findFirst({
    where: { slug, published: true },
    include: {
      topic: true,
      related: { where: { published: true }, select: { slug: true, title: true, difficulty: true } },
    },
  });
  if (!problem) notFound();

  const steps = asArray(problem.steps);
  const rubric = asArray(problem.rubric);
  const scenarioData = asArray(problem.scenarioData);

  const [user, neighbors] = await Promise.all([getOrCreateUser(), getProblemNeighbors(slug)]);
  const upNext = await getUpNext({ userId: user?.id ?? null, currentSlug: slug });

  let progress = null;
  let submission = null;
  let evaluation = null;
  let ownShared = null;
  let bookmarked = false;

  if (user) {
    const key = { userId_problemId: { userId: user.id, problemId: problem.id } };
    const [pr, sub, bm, shared] = await Promise.all([
      prisma.problemProgress.findUnique({ where: key }),
      prisma.submission.findUnique({ where: key }),
      prisma.bookmark.findUnique({ where: key }),
      prisma.communityAnswer.findUnique({ where: key, select: { status: true, anonymous: true, content: true } }),
    ]);
    progress = pr;
    submission = sub;
    bookmarked = Boolean(bm);
    ownShared = shared;

    // Latest AI feedback for this user's answer
    if (sub) {
      evaluation = await prisma.evaluation.findFirst({
        where: { submissionId: sub.id },
        orderBy: { createdAt: 'desc' },
      });
    }
  }

  // The reference answer and community content are only queried once the user has earned access,
  // so neither reaches the browser of someone who hasn't unlocked them.
  const unlocked = Boolean(user && (submission || progress?.solutionRevealed));
  const [solution, community] = unlocked
    ? await Promise.all([
        prisma.expertSolution.findUnique({ where: { problemId: problem.id } }),
        getCommunityAnswers({ problemId: problem.id, viewerId: user.id, page: cpage }),
      ])
    : [null, null];

  const shared = ownShared
    ? {
        status: ownShared.status,
        anonymous: ownShared.anonymous,
        outOfDate: Boolean(submission) && ownShared.content !== submission.content,
      }
    : null;

  // True when the user edited their answer after the feedback was generated
  const stale = Boolean(evaluation && submission && evaluation.contentHash !== hashContent(submission.content));

  const loginHref = `/login?redirect_url=${encodeURIComponent(`/problems/${slug}`)}`;

  const pill = 'rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-muted';
  const sectionTitle = 'cursor-pointer list-none text-sm font-semibold marker:hidden [&::-webkit-details-marker]:hidden';

  const description = (
    <article>
      <h1 className="text-xl font-semibold leading-snug tracking-tight">{problem.title}</h1>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <DifficultyBadge difficulty={problem.difficulty} />
        {problem.isChallenge && (
          <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">Production challenge</span>
        )}
        <Link href={`/topics/${problem.topic.slug}`} className={`${pill} hover:text-ink`}>{problem.topic.name}</Link>
        <span className={pill}>{TYPE_LABEL[problem.type]}</span>
        <span className={pill}>{problem.estimatedMinutes} min</span>
        <BookmarkButton problemId={problem.id} slug={slug} initial={bookmarked} signedIn={Boolean(user)} pill />
        {progress?.status === 'COMPLETED' && <span className="rounded-full bg-easy/12 px-2.5 py-0.5 text-xs font-semibold text-easy">Completed</span>}
      </div>

      <section aria-label="Problem statement" className="mt-5">
        <Markdown>{problem.description}</Markdown>
      </section>

      {scenarioData.length > 0 && (
        <section aria-label="Scenario data" className="mt-6">
          <h2 className="text-sm font-semibold">Scenario data</h2>
          <p className="mt-1 text-xs text-muted">Logs and configuration from the incident. Use them as evidence in your answer.</p>
          <div className="mt-3 space-y-3">
            {scenarioData.map((a, i) => (
              <details key={i} open={i === 0} className="rounded-lg border border-line bg-surface">
                <summary className="cursor-pointer px-4 py-2.5 text-sm font-medium">{a.title}</summary>
                <div className="overflow-x-auto border-t border-line px-1 py-1">
                  <Markdown>{fence(a)}</Markdown>
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {steps.length > 0 && (
        <section aria-label="How to answer" className="mt-6">
          <h2 className="text-sm font-semibold">How to answer</h2>
          <p className="mt-1 text-xs text-muted">Write your answer in {steps.length} steps in the editor on the right.</p>
          <ol className="mt-3 space-y-2 text-sm">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-semibold">{i + 1}</span>
                <span>
                  <span className="font-medium">{s.title}.</span> <span className="text-muted">{s.prompt}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="mt-6">
        <Hints hints={problem.hints} />
      </div>

      <div className="mt-6 divide-y divide-line border-y border-line">
        {problem.related.length > 0 && (
          <details className="py-3">
            <summary className={sectionTitle}>{problem.isChallenge ? 'Related challenges' : 'Related questions'}</summary>
            <ul className="mt-3 space-y-2 text-sm">
              {problem.related.map((r) => (
                <li key={r.slug} className="flex items-center justify-between gap-3">
                  <Link href={`/problems/${r.slug}`} className="hover:text-accent">{r.title}</Link>
                  <DifficultyBadge difficulty={r.difficulty} />
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </article>
  );

  const feedbackPane = (
    <section aria-labelledby="feedback-heading">
      <h2 id="feedback-heading" className="text-lg font-semibold">AI feedback</h2>

      {!unlocked ? (
        <div className="mt-4 flex flex-col items-start gap-3 rounded-lg bg-surface-2 px-5 py-6">
          <p className="flex items-center gap-2 font-medium">
            <Lock width={18} height={18} /> Locked until you attempt this problem
          </p>
          <p className="text-sm text-muted">
            {user
              ? 'Submit your answer on the right to get personalised AI feedback.'
              : 'Log in and submit an answer to get personalised AI feedback.'}
          </p>
          {user && problem.allowDirectReveal && <RevealButton problemId={problem.id} />}
        </div>
      ) : (
        <div className="mt-4">
          {submission ? (
            evaluation ? (
              <>
                {stale && (
                  <div className="mb-4 rounded-lg bg-surface-2 px-4 py-3 text-sm">
                    <p>You changed your answer after this feedback was generated.</p>
                    <div className="mt-2">
                      <FeedbackControls problemId={problem.id} label="Re-evaluate my answer" />
                    </div>
                  </div>
                )}
                <FeedbackView
                  rubric={rubric}
                  evaluation={{
                    score: evaluation.score,
                    scores: evaluation.scores,
                    feedback: evaluation.feedback,
                    model: evaluation.model,
                    createdAt: evaluation.createdAt.toISOString(),
                  }}
                />
              </>
            ) : (
              <div className="rounded-lg bg-surface-2 px-5 py-5">
                <p className="text-sm">Your answer is saved but has no AI feedback yet.</p>
                <div className="mt-3">
                  <FeedbackControls problemId={problem.id} label="Get AI feedback" />
                </div>
              </div>
            )
          ) : (
            <p className="text-sm text-muted">
              You opened the reference answer without submitting. Submit your own answer to get personalised AI feedback.
            </p>
          )}

          <details className="mt-8 border-t border-line pt-4" open={!submission}>
            <summary className={sectionTitle}>Reference answer</summary>
            {solution ? (
              <div className="mt-4">
                <p className="mb-4 text-sm text-muted">
                  The AI uses this as a guide. It has not been reviewed by a human expert, so check important details against other sources.
                </p>
                <Markdown>{solution.content}</Markdown>
                {solution.alternatives && (
                  <div className="mt-6 border-t border-line pt-4">
                    <h3 className="text-sm font-semibold">Alternative approaches and trade-offs</h3>
                    <div className="mt-3">
                      <Markdown>{solution.alternatives}</Markdown>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted">No reference answer has been added for this problem yet.</p>
            )}
          </details>

          <div className="mt-6 border-t border-line pt-5">
            <CompleteToggle problemId={problem.id} completed={progress?.status === 'COMPLETED'} />
          </div>
        </div>
      )}
    </section>
  );

  const communityPane = (
    <section aria-labelledby="community-heading">
      <h2 id="community-heading" className="text-lg font-semibold">Community solutions</h2>
      {community ? (
        <CommunitySection data={community} slug={slug} />
      ) : (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted">
          <Lock width={16} height={16} />
          {user
            ? 'Community answers unlock after you submit an attempt or reveal the solution.'
            : 'Log in and attempt this problem to read how other learners answered it.'}
        </p>
      )}
    </section>
  );

  const tabs = [
    { id: 'description', label: 'Description', icon: <FileText width={16} height={16} />, content: description },
    { id: 'feedback', label: 'AI Feedback', icon: unlocked ? <Flask width={16} height={16} /> : <Lock width={15} height={15} />, content: feedbackPane },
    { id: 'community', label: 'Community', icon: <Users width={16} height={16} />, content: communityPane },
  ];

  const arrow = 'grid h-8 w-8 place-items-center rounded-md text-ink transition-colors hover:bg-surface';
  const arrowOff = 'grid h-8 w-8 place-items-center rounded-md text-muted opacity-40';

  const jsonLd = graph(
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Problems', path: '/problems' },
      { name: problem.topic.name, path: `/topics/${problem.topic.slug}` },
      { name: problem.title, path: `/problems/${slug}` },
    ]),
    problemJsonLd(problem),
  );

  return (
    <div data-workspace className="flex flex-col bg-canvas px-2 pb-2 lg:h-[calc(100dvh-4rem)]">
      <JsonLd data={jsonLd} />
      {/* Top bar: problem list popup, previous / next, timer */}
      <div className="flex h-12 shrink-0 items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <ProblemListPopup items={upNext.items} remaining={upNext.remaining} signedIn={Boolean(user)} />
          {neighbors.prev ? (
            <Link href={`/problems/${neighbors.prev}`} className={arrow} aria-label="Previous problem" title="Previous problem">
              <ChevronLeft width={18} height={18} />
            </Link>
          ) : (
            <span className={arrowOff} aria-hidden="true"><ChevronLeft width={18} height={18} /></span>
          )}
          {neighbors.next ? (
            <Link href={`/problems/${neighbors.next}`} className={arrow} aria-label="Next problem" title="Next problem">
              <ChevronRight width={18} height={18} />
            </Link>
          ) : (
            <span className={arrowOff} aria-hidden="true"><ChevronRight width={18} height={18} /></span>
          )}
        </div>
        <Timer />
        <p className="hidden w-40 text-right text-xs text-muted sm:block">
          {neighbors.index} of {neighbors.total}
        </p>
      </div>

      <Workspace
        leftLabel="Problem"
        rightLabel="Answer"
        left={
          <>
            <nav aria-label="Breadcrumb" className="sr-only">
              <Link href="/problems">Problems</Link> / <Link href={`/topics/${problem.topic.slug}`}>{problem.topic.name}</Link>
            </nav>
            <ProblemTabs tabs={tabs} initial={sp?.cpage ? 'community' : 'description'} />
          </>
        }
        right={
          <>
            <div className="flex h-10 shrink-0 items-center gap-2 border-b border-line bg-surface-2 pl-4 pr-20 text-sm font-medium">
              <Code width={16} height={16} className="text-go" /> Answer
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              {user ? (
                <>
                  <AnswerEditor
                    problemId={problem.id}
                    initialContent={submission?.content ?? ''}
                    hasSubmission={Boolean(submission)}
                    steps={steps.length ? steps : null}
                  />
                  {/* Only shown once an answer has been submitted */}
                  {submission && (
                    <div className="shrink-0 border-t border-line p-3">
                      <ShareControl problemId={problem.id} hasSubmission shared={shared} />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex min-h-[26rem] flex-[1_0_auto] flex-col">
                  <div className="flex-1 px-4 py-3 font-mono text-[0.85rem] text-muted/70">
                    Write your answer here. Your answer is private unless you choose to share it.
                  </div>
                  <div className="shrink-0 border-t border-line bg-surface-2 px-4 py-3 text-sm">
                    You need to{' '}
                    <Link href={loginHref} className="font-semibold text-accent hover:underline">log in</Link>
                    {' / '}
                    <Link href="/register" className="font-semibold text-accent hover:underline">sign up</Link>
                    {' '}to submit an answer and get AI feedback.
                  </div>
                </div>
              )}
            </div>
          </>
        }
      />
    </div>
  );
}