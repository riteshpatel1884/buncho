import { prisma } from './prisma';
import { DIFFICULTIES, PROBLEM_TYPES, PAGE_SIZE } from './constants';

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

export async function getProblems({ q, topic, difficulty, type, page }) {
  const where = {
    published: true,
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
      orderBy: [{ difficulty: 'asc' }, { position: 'asc' }, { title: 'asc' }],
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
