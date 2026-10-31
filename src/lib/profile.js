import { cache } from 'react';
import { prisma } from './prisma';
import { getUserStats } from './problems';
import { getIsPro } from './subscription';
import { displayName } from './community';
import { normalizeUsername, validateUsername } from './username';
import { plainText, truncate } from './seo';

/* ------------------------------------------------------------------ */
/* Public profile data. Everything here is safe to show to strangers:  */
/* no email, no private submissions, no Pro-only question content, no  */
/* anonymous answers. Owner toggles (showStats, showAnswers) are       */
/* applied here, so the page cannot forget them.                        */
/* ------------------------------------------------------------------ */

export const LEVELS = [
  { key: 'rookie', name: 'Rookie', min: 0 },
  { key: 'practitioner', name: 'Practitioner', min: 5 },
  { key: 'specialist', name: 'Specialist', min: 15 },
  { key: 'expert', name: 'Expert', min: 40 },
  { key: 'master', name: 'Master', min: 100 },
];

export function getLevel(solved) {
  let i = 0;
  LEVELS.forEach((l, idx) => {
    if (solved >= l.min) i = idx;
  });
  const level = LEVELS[i];
  const next = LEVELS[i + 1] ?? null;
  const progress = next ? (solved - level.min) / (next.min - level.min) : 1;
  return { ...level, index: i, next, progress, toNext: next ? next.min - solved : 0 };
}

// Badges are computed from real activity. Nothing is stored, so they can never drift from the numbers.
const BADGES = [
  { id: 'first', icon: '🚀', name: 'First solve', desc: 'Solved a first problem', test: (m) => m.solved >= 1 },
  { id: 'ten', icon: '🔟', name: '10 solved', desc: 'Solved 10 problems', test: (m) => m.solved >= 10 },
  { id: 'fifty', icon: '🏅', name: '50 solved', desc: 'Solved 50 problems', test: (m) => m.solved >= 50 },
  { id: 'hundred', icon: '💯', name: 'Century', desc: 'Solved 100 problems', test: (m) => m.solved >= 100 },
  { id: 'streak7', icon: '🔥', name: 'On fire', desc: 'Reached a 7 day streak', test: (m) => m.streak >= 7 },
  { id: 'streak30', icon: '⚡', name: 'Unstoppable', desc: 'Reached a 30 day streak', test: (m) => m.streak >= 30 },
  { id: 'hard', icon: '🧗', name: 'Hard mode', desc: 'Solved 5 hard problems', test: (m) => m.hard >= 5 },
  { id: 'scholar', icon: '🎓', name: 'AI scholar', desc: 'Average AI score of 80+ over 5 answers', test: (m) => m.evals >= 5 && m.avgScore >= 80 },
  { id: 'helper', icon: '🤝', name: 'Helpful', desc: 'Got 10 helpful votes on shared answers', test: (m) => m.helpful >= 10 },
  { id: 'sharer', icon: '📣', name: 'Community voice', desc: 'Shared 3 answers publicly', test: (m) => m.shared >= 3 },
  { id: 'regular', icon: '📅', name: 'Regular', desc: 'Practised on 20 different days', test: (m) => m.activeDays >= 20 },
  { id: 'pro', icon: '👑', name: 'Pro member', desc: 'Supports Buncho with Pro', test: (m) => m.pro },
];

export const badgeList = (m) => BADGES.map(({ test, ...b }) => ({ ...b, earned: Boolean(test(m)) }));

/** One query by unique username. Cached per request so generateMetadata and the page share it. */
export const findProfileUser = cache(async (raw) => {
  const check = validateUsername(raw);
  if (!check.ok) return null;
  return prisma.user.findUnique({
    where: { username: normalizeUsername(raw) },
    select: {
      id: true,
      username: true,
      name: true,
      profileName: true,
      imageUrl: true,
      headline: true,
      bio: true,
      location: true,
      website: true,
      githubHandle: true,
      linkedinHandle: true,
      xHandle: true,
      profilePublic: true,
      showStats: true,
      showAnswers: true,
      profileViews: true,
      createdAt: true,
    },
  });
});

export const publicName = (u) => u.profileName || displayName(u.name);

/** Everything the profile page and the share image show. Cached per request. */
export const getProfileData = cache(async (user) => {
  const pro = await getIsPro(user.id);
  const base = { name: publicName(user), pro, stats: null, level: null, topics: [], avgScore: null, evals: 0, helpful: 0, answers: [], sharedCount: 0, badges: [] };

  const [stats, completed, evals, helpful, sharedCount, answers] = await Promise.all([
    user.showStats ? getUserStats(user.id) : null,
    user.showStats
      ? prisma.problemProgress.findMany({
          where: { userId: user.id, status: 'COMPLETED', problem: { published: true } },
          select: { problemId: true, problem: { select: { difficulty: true, topic: { select: { name: true, slug: true } } } } },
        })
      : [],
    user.showStats
      ? prisma.evaluation.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, select: { problemId: true, score: true } })
      : [],
    prisma.answerVote.count({ where: { answer: { userId: user.id, status: 'PUBLISHED', anonymous: false } } }),
    prisma.communityAnswer.count({ where: { userId: user.id, status: 'PUBLISHED', anonymous: false, problem: { published: true, proOnly: false } } }),
    user.showAnswers
      ? prisma.communityAnswer.findMany({
          where: { userId: user.id, status: 'PUBLISHED', anonymous: false, problem: { published: true, proOnly: false } },
          orderBy: [{ votes: { _count: 'desc' } }, { createdAt: 'desc' }],
          take: 4,
          select: {
            id: true,
            content: true,
            createdAt: true,
            _count: { select: { votes: true } },
            problem: { select: { slug: true, title: true, difficulty: true, topic: { select: { name: true } } } },
          },
        })
      : [],
  ]);

  const out = { ...base, helpful, sharedCount };

  out.answers = answers.map((a) => ({
    id: a.id,
    excerpt: truncate(plainText(a.content), 220),
    votes: a._count.votes,
    date: a.createdAt,
    problem: a.problem,
  }));

  if (!stats) return out;

  // Latest AI score per problem
  const latest = new Map();
  for (const e of evals) if (!latest.has(e.problemId)) latest.set(e.problemId, e.score);
  const scores = [...latest.values()];
  const avgScore = scores.length ? Math.round(scores.reduce((s, x) => s + x, 0) / scores.length) : null;

  // Strength per topic: solved count, and the average AI score over solved problems that were evaluated
  const byTopic = new Map();
  let hard = 0;
  completed.forEach((c) => {
    if (c.problem.difficulty === 'HARD') hard += 1;
    const t = c.problem.topic;
    const row = byTopic.get(t.slug) ?? { slug: t.slug, name: t.name, solved: 0, sum: 0, n: 0 };
    row.solved += 1;
    if (latest.has(c.problemId)) {
      row.sum += latest.get(c.problemId);
      row.n += 1;
    }
    byTopic.set(t.slug, row);
  });
  const topics = [...byTopic.values()]
    .map((t) => ({ slug: t.slug, name: t.name, solved: t.solved, avg: t.n ? Math.round(t.sum / t.n) : null }))
    .sort((a, b) => b.solved - a.solved || (b.avg ?? 0) - (a.avg ?? 0))
    .slice(0, 8);

  const metrics = {
    solved: stats.solved,
    streak: stats.streak,
    hard,
    evals: scores.length,
    avgScore: avgScore ?? 0,
    helpful,
    shared: sharedCount,
    activeDays: Object.keys(stats.activeDays).length,
    pro,
  };

  return {
    ...out,
    stats,
    level: getLevel(stats.solved),
    topics,
    avgScore,
    evals: scores.length,
    badges: badgeList(metrics),
  };
});