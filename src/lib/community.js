import { prisma } from './prisma';
import { COMMUNITY_PAGE_SIZE } from './constants';

export function formatDate(d) {
  return d.toLocaleDateString('en-IN', { dateStyle: 'medium', timeZone: 'Asia/Kolkata' });
}

/** "Priya Sharma" -> "Priya S." so full names are not exposed publicly. */
export function displayName(name) {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'A Buncho learner';
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

/** Community content is only available after an attempt or an explicit reveal. */
export async function hasUnlocked(userId, problemId) {
  const key = { userId_problemId: { userId, problemId } };
  const [submission, progress] = await Promise.all([
    prisma.submission.findUnique({ where: key, select: { id: true } }),
    prisma.problemProgress.findUnique({ where: key, select: { solutionRevealed: true } }),
  ]);
  return Boolean(submission || progress?.solutionRevealed);
}

/** Published answers by other users, most helpful first. The viewer's own answer is excluded. */
export async function getCommunityAnswers({ problemId, viewerId, page = 1 }) {
  const where = { problemId, status: 'PUBLISHED', userId: { not: viewerId } };

  const [rows, total] = await Promise.all([
    prisma.communityAnswer.findMany({
      where,
      orderBy: [{ votes: { _count: 'desc' } }, { createdAt: 'desc' }, { id: 'asc' }],
      skip: (page - 1) * COMMUNITY_PAGE_SIZE,
      take: COMMUNITY_PAGE_SIZE,
      select: {
        id: true,
        content: true,
        anonymous: true,
        createdAt: true,
        user: { select: { name: true } },
        _count: { select: { votes: true, comments: true } },
        votes: { where: { userId: viewerId }, select: { id: true } },
        bookmarks: { where: { userId: viewerId }, select: { id: true } },
        reports: { where: { reporterId: viewerId }, select: { id: true } },
      },
    }),
    prisma.communityAnswer.count({ where }),
  ]);

  const items = rows.map((r) => ({
    id: r.id,
    content: r.content,
    author: r.anonymous ? 'Anonymous learner' : displayName(r.user.name),
    dateLabel: formatDate(r.createdAt),
    helpful: r._count.votes,
    commentCount: r._count.comments,
    voted: r.votes.length > 0,
    saved: r.bookmarks.length > 0,
    reported: r.reports.length > 0,
  }));

  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / COMMUNITY_PAGE_SIZE)) };
}