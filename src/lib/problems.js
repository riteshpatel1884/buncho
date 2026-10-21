import { prisma } from './prisma';
import { DIFFICULTIES, PROBLEM_TYPES, PAGE_SIZE } from './constants';

// Same ordering everywhere a problem list or "next problem" is shown.
const PROBLEM_ORDER = [{ difficulty: 'asc' }, { position: 'asc' }, { title: 'asc' }];

/** Turns untrusted search params into a safe filter object. */
export function parseFilters(sp = {}) {
  const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  return {
    q: str(sp.q, 100),
    topic: str(sp.topic, 80),
    difficulty: DIFFICULTIES.includes(sp.difficulty) ? sp.difficulty : '',
    type: PROBLEM_TYPES.includes(sp.type) ? sp.type : '',
    page: Math.max(1, parseInt(sp.page, 10) || 1),
  };
}

export async function getProblems({ q, topic, difficulty, type, page, challenge }) {
  const where = {
    published: true,
    ...(challenge && { isChallenge: true }),
    ...(topic && { topic: { slug: topic } }),
    ...(difficulty && { difficulty }),
    ...(type && { type }),
    ...(q && {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { subcategory: { contains: q, mode: 'insensitive' } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.problem.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        type: true,
        estimatedMinutes: true,
        topic: { select: { name: true, slug: true } },
      },
      orderBy: PROBLEM_ORDER,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.problem.count({ where }),
  ]);

  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export function getTopics() {
  return prisma.topic.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { problems: { where: { published: true } } } } },
  });
}

/** Map of problemId -> status for one user. */
export async function getProgressMap(userId, problemIds) {
  if (!problemIds.length) return {};
  const rows = await prisma.problemProgress.findMany({
    where: { userId, problemId: { in: problemIds } },
    select: { problemId: true, status: true },
  });
  return Object.fromEntries(rows.map((r) => [r.problemId, r.status]));
}

/** Previous / next problem in the same order as the problem list. */
export async function getProblemNeighbors(slug) {
  const all = await prisma.problem.findMany({
    where: { published: true },
    select: { slug: true },
    orderBy: PROBLEM_ORDER,
  });
  const i = all.findIndex((p) => p.slug === slug);
  return {
    prev: i > 0 ? all[i - 1].slug : null,
    next: i >= 0 && i < all.length - 1 ? all[i + 1].slug : null,
    index: i + 1,
    total: all.length,
  };
}

/** YYYY-MM-DD for a date in India time, used to group practice activity by day. */
export function dayKey(date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Progress numbers for the rings, bars and streak. Works signed out too
 * (userId null): totals are filled in, everything personal stays at zero.
 */
export async function getUserStats(userId) {
  const [totals, rows] = await Promise.all([
    prisma.problem.groupBy({ by: ['difficulty'], where: { published: true }, _count: { _all: true } }),
    userId
      ? prisma.problemProgress.findMany({
          where: { userId },
          orderBy: { lastActivityAt: 'desc' },
          select: {
            status: true,
            lastActivityAt: true,
            problem: { select: { slug: true, title: true, difficulty: true, published: true } },
          },
        })
      : [],
  ]);

  const byDifficulty = { EASY: { solved: 0, total: 0 }, MEDIUM: { solved: 0, total: 0 }, HARD: { solved: 0, total: 0 } };
  totals.forEach((t) => {
    if (byDifficulty[t.difficulty]) byDifficulty[t.difficulty].total = t._count._all;
  });

  let solved = 0;
  let attempted = 0;
  let last = null;
  const activeDays = {};

  rows.forEach((r) => {
    if (r.status === 'COMPLETED' && r.problem.published) {
      solved += 1;
      if (byDifficulty[r.problem.difficulty]) byDifficulty[r.problem.difficulty].solved += 1;
    }
    if (r.status === 'ATTEMPTED') {
      attempted += 1;
      if (!last && r.problem.published) last = r.problem;
    }
    if (r.lastActivityAt) {
      const k = dayKey(r.lastActivityAt);
      activeDays[k] = (activeDays[k] ?? 0) + 1;
    }
  });

  // Streak: consecutive active days up to today (yesterday still counts if today is empty)
  let streak = 0;
  const now = Date.now();
  const startOffset = activeDays[dayKey(new Date(now))] ? 0 : 1;
  for (let i = startOffset; i < 400; i += 1) {
    if (activeDays[dayKey(new Date(now - i * 86400000))]) streak += 1;
    else break;
  }

  const total = Object.values(byDifficulty).reduce((s, d) => s + d.total, 0);
  return { total, solved, attempted, byDifficulty, activeDays, streak, last };
}



/**
 * Next unsolved problems after the current one (wrapping around), for the Problem List popup.
 * Signed-out visitors just get the next problems in order.
 */
export async function getUpNext({ userId, currentSlug, limit = 20 }) {
  const all = await prisma.problem.findMany({
    where: { published: true },
    select: { id: true, slug: true, title: true, difficulty: true },
    orderBy: PROBLEM_ORDER,
  });
  const status = userId ? await getProgressMap(userId, all.map((p) => p.id)) : {};

  const i = all.findIndex((p) => p.slug === currentSlug);
  const rotated = i >= 0 ? [...all.slice(i + 1), ...all.slice(0, i)] : all;
  const unsolved = rotated.filter((p) => status[p.id] !== 'COMPLETED');

  return {
    items: unsolved.slice(0, limit).map((p) => ({
      slug: p.slug,
      title: p.title,
      difficulty: p.difficulty,
      attempted: status[p.id] === 'ATTEMPTED',
    })),
    remaining: unsolved.length,
  };
}