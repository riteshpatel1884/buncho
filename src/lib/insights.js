import { prisma } from './prisma';
import {
  COMPETENCIES,
  READINESS_FULL_CONFIDENCE,
  READINESS_PROVISIONAL_BELOW,
  REVISION_INTERVAL_DAYS,
  WEAK_BELOW,
} from './constants';
import { dayKey } from './problems';

const DAY = 86400000;
const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'Asia/Kolkata' });

const levelFor = (s) => (s >= 80 ? 'Strong' : s >= 65 ? 'Solid' : s >= 45 ? 'Developing' : 'Early');
const intervalFor = (score) => REVISION_INTERVAL_DAYS.find(([below]) => score < below)[1];
const weightOfTopic = (slug) => COMPETENCIES.find((c) => c.topics.includes(slug))?.weight ?? 5;

/**
 * Everything the dashboard needs beyond raw counts. All numbers come from the user's AI evaluation
 * scores (latest evaluation per problem) with fixed, documented formulas.
 */
export async function getInsights(userId) {
  const now = Date.now();

  const [topics, problems, progress, evals] = await Promise.all([
    prisma.topic.findMany({ orderBy: { order: 'asc' }, select: { id: true, slug: true, name: true } }),
    prisma.problem.findMany({
      where: { published: true },
      orderBy: [{ difficulty: 'asc' }, { position: 'asc' }],
      select: { id: true, slug: true, title: true, difficulty: true, isChallenge: true, topicId: true },
    }),
    prisma.problemProgress.findMany({ where: { userId }, select: { problemId: true, status: true } }),
    prisma.evaluation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { problemId: true, score: true, createdAt: true },
    }),
  ]);

  // Latest evaluation per problem = how well the current answer does
  const latest = new Map();
  for (const e of evals) if (!latest.has(e.problemId)) latest.set(e.problemId, e);
  const problemById = new Map(problems.map((p) => [p.id, p]));

  /* ---- Per topic ---- */
  const topicStats = new Map(topics.map((t) => [t.id, { topic: t, total: 0, evaluated: 0, sum: 0 }]));
  problems.forEach((p) => {
    const s = topicStats.get(p.topicId);
    if (s) s.total += 1;
  });
  latest.forEach((e, problemId) => {
    const p = problemById.get(problemId);
    const s = p && topicStats.get(p.topicId);
    if (s) {
      s.evaluated += 1;
      s.sum += e.score;
    }
  });
  const topicRows = [...topicStats.values()]
    .filter((s) => s.total > 0)
    .map((s) => ({
      id: s.topic.id,
      slug: s.topic.slug,
      name: s.topic.name,
      total: s.total,
      evaluated: s.evaluated,
      avg: s.evaluated ? Math.round(s.sum / s.evaluated) : null,
      weight: weightOfTopic(s.topic.slug),
    }));

  /* ---- Competencies and readiness ---- */
  const bySlug = new Map(topicRows.map((t) => [t.slug, { ...t, sum: topicStats.get(t.id).sum }]));
  const competencies = COMPETENCIES.map((c) => {
    let total = 0;
    let evaluated = 0;
    let sum = 0;
    c.topics.forEach((slug) => {
      const t = bySlug.get(slug);
      if (t) {
        total += t.total;
        evaluated += t.evaluated;
        sum += t.sum;
      }
    });
    const need = Math.max(1, Math.min(total, READINESS_FULL_CONFIDENCE));
    return {
      key: c.key,
      name: c.name,
      weight: c.weight,
      total,
      evaluated,
      avg: evaluated ? Math.round(sum / evaluated) : null,
      // Average of the latest scores, scaled down until enough answers back it up
      score: evaluated ? Math.round((sum / evaluated) * Math.min(1, evaluated / need)) : null,
    };
  });

  const evaluatedProblems = topicRows.reduce((a, t) => a + t.evaluated, 0);
  const weightSum = competencies.reduce((a, c) => a + c.weight, 0);
  // Competencies with no evaluated answers count as 0, so gaps lower the score
  const score = evaluatedProblems
    ? Math.round(competencies.reduce((a, c) => a + c.weight * (c.score ?? 0), 0) / weightSum)
    : null;

  const readiness = {
    score,
    label: score === null ? 'Not assessed yet' : levelFor(score),
    provisional: evaluatedProblems < READINESS_PROVISIONAL_BELOW,
    assessed: competencies.filter((c) => c.score !== null).length,
    totalCompetencies: competencies.length,
    evaluatedProblems,
  };

  /* ---- Weak topics ---- */
  const weakTopics = [
    ...topicRows
      .filter((t) => t.avg !== null && t.avg < WEAK_BELOW)
      .sort((a, b) => a.avg - b.avg)
      .map((t) => ({ ...t, reason: 'low' })),
    ...topicRows
      .filter((t) => t.avg === null)
      .sort((a, b) => b.weight - a.weight)
      .map((t) => ({ ...t, reason: 'untouched' })),
  ].slice(0, 4);

  /* ---- Revision queue (spaced by score) ---- */
  const revision = [...latest.values()]
    .map((e) => {
      const p = problemById.get(e.problemId);
      if (!p) return null;
      const due = e.createdAt.getTime() + intervalFor(e.score) * DAY;
      if (due > now) return null;
      return {
        slug: p.slug,
        title: p.title,
        difficulty: p.difficulty,
        score: e.score,
        overdueDays: Math.floor((now - due) / DAY),
        answeredDaysAgo: Math.floor((now - e.createdAt.getTime()) / DAY),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.overdueDays - a.overdueDays || a.score - b.score)
    .slice(0, 8);

  /* ---- Weekly activity (answers that received AI feedback) ---- */
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now - (6 - i) * DAY);
    return { key: dayKey(d), label: weekday.format(d), count: 0 };
  });
  const dayIndex = new Map(days.map((d, i) => [d.key, i]));
  const weeks = Array.from({ length: 8 }, () => 0);
  evals.forEach((e) => {
    const i = dayIndex.get(dayKey(e.createdAt));
    if (i !== undefined) days[i].count += 1;
    const w = Math.floor((now - e.createdAt.getTime()) / (7 * DAY));
    if (w >= 0 && w < 8) weeks[7 - w] += 1;
  });
  const weekly = { days, weeks, answersThisWeek: days.reduce((a, d) => a + d.count, 0) };

  /* ---- Recommendations: unanswered problems in the areas that need the most work ---- */
  const doneIds = new Set(progress.filter((p) => p.status === 'COMPLETED').map((p) => p.problemId));
  const open = problems.filter((p) => !doneIds.has(p.id) && !latest.has(p.id));
  const prefer = (avg) =>
    avg === null || avg < 50 ? ['EASY', 'MEDIUM', 'HARD'] : avg < 75 ? ['MEDIUM', 'EASY', 'HARD'] : ['HARD', 'MEDIUM', 'EASY'];

  const recommendations = [];
  const byPriority = [...topicRows].sort((a, b) => (100 - (b.avg ?? 0)) * b.weight - (100 - (a.avg ?? 0)) * a.weight);
  for (const t of byPriority) {
    if (recommendations.length >= 5) break;
    const order = prefer(t.avg);
    const picks = open
      .filter((p) => p.topicId === t.id)
      .sort((a, b) => order.indexOf(a.difficulty) - order.indexOf(b.difficulty))
      .slice(0, 2);
    for (const p of picks) {
      if (recommendations.length >= 5) break;
      recommendations.push({
        slug: p.slug,
        title: p.title,
        difficulty: p.difficulty,
        isChallenge: p.isChallenge,
        reason: t.avg === null ? `You haven't tried ${t.name} yet` : `Your ${t.name} average is ${t.avg}/100`,
      });
    }
  }

  return { readiness, competencies, weakTopics, revision, weekly, recommendations };
}