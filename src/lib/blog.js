import { prisma } from './prisma';
import { BLOG_PAGE_SIZE } from './blog-constants';

/**
 * A post is public when it is PUBLISHED or SCHEDULED and its publishedAt has passed. Scheduling needs no cron job:
 * a SCHEDULED post starts matching this filter the moment its time arrives. Drafts and unpublished posts never match.
 */
export const liveWhere = (now = new Date()) => ({
  status: { in: ['PUBLISHED', 'SCHEDULED'] },
  publishedAt: { lte: now },
});

/** Status as readers/admins should see it: a SCHEDULED post whose time has passed is effectively published. */
export function effectiveStatus(post, now = new Date()) {
  if (post.status === 'SCHEDULED' && post.publishedAt && post.publishedAt <= now) return 'PUBLISHED';
  return post.status;
}

export const isLive = (post, now = new Date()) =>
  ['PUBLISHED', 'SCHEDULED'].includes(post.status) && Boolean(post.publishedAt) && post.publishedAt <= now;

const cardSelect = {
  id: true,
  kind: true,
  folder: true,
  sortOrder: true,
  slug: true,
  title: true,
  excerpt: true,
  category: true,
  tags: true,
  level: true,
  coverImage: true,
  coverAlt: true,
  featured: true,
  publishedAt: true,
  readingMinutes: true,
  author: { select: { name: true } },
};

export function parseBlogParams(sp = {}) {
  const one = (v) => (Array.isArray(v) ? v[0] : v);
  const q = String(one(sp.q) ?? '').trim().slice(0, 80);
  const tag = String(one(sp.tag) ?? '').trim().toLowerCase().slice(0, 32);
  const page = Math.max(1, Math.min(500, parseInt(one(sp.page), 10) || 1));
  return { q, tag, page };
}

/** Paginated public listing with optional search, tag and category filters. */
export async function getPosts({ q = '', tag = '', category = '', page = 1, pageSize = BLOG_PAGE_SIZE, excludeIds = [] } = {}) {
  const now = new Date();
  const and = [liveWhere(now)];
  if (category) and.push({ category });
  if (tag) and.push({ tags: { has: tag } });
  if (excludeIds.length) and.push({ id: { notIn: excludeIds } });
  if (q) {
    const contains = { contains: q, mode: 'insensitive' };
    and.push({
      OR: [
        { title: contains },
        { excerpt: contains },
        { contentText: contains },
        { tags: { has: q.toLowerCase() } },
      ],
    });
  }
  const where = { AND: and };
  const [total, items] = await Promise.all([
    prisma.blogPost.count({ where }),
    prisma.blogPost.findMany({
      where,
      select: cardSelect,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  return { items, total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

export function getFeaturedPosts(take = 3) {
  return prisma.blogPost.findMany({
    where: { AND: [liveWhere(), { featured: true }] },
    select: cardSelect,
    orderBy: { publishedAt: 'desc' },
    take,
  });
}

/** Tags used by live posts with counts, most used first. Small blog, so counting in memory is fine. */
export async function getTagCounts(limit = 14) {
  const rows = await prisma.blogPost.findMany({ where: liveWhere(), select: { tags: true } });
  const counts = new Map();
  rows.forEach((r) => r.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit).map(([tag, count]) => ({ tag, count }));
}

export async function getCategoryCounts() {
  const rows = await prisma.blogPost.groupBy({ by: ['category'], where: liveWhere(), _count: { _all: true } });
  return Object.fromEntries(rows.map((r) => [r.category, r._count._all]));
}

const fullSelect = {
  ...cardSelect,
  content: true,
  keyTakeaways: true,
  resources: true,
  practiceProblemIds: true,
  seoTitle: true,
  metaDescription: true,
  canonicalUrl: true,
  status: true,
  scheduledFor: true,
  views: true,
  lastEditedAt: true,
  createdAt: true,
  authorId: true,
  author: { select: { name: true, imageUrl: true } },
  _count: { select: { likes: true, comments: true } },
};

/** A live post by slug, or null. Never returns drafts. */
export function getLivePost(slug) {
  return prisma.blogPost.findFirst({ where: { slug, ...liveWhere() }, select: fullSelect });
}

/** Same shape for any status; admin pages only (callers must have checked isAdmin). */
export function getPostForAdmin(id) {
  return prisma.blogPost.findUnique({ where: { id }, select: { ...fullSelect, slug: true, previousSlugs: true, coverAlt: true } });
}

/** If someone requests an old slug, returns the current one so the route can 301 to it. */
export async function findSlugRedirect(slug) {
  const post = await prisma.blogPost.findFirst({
    where: { previousSlugs: { has: slug }, ...liveWhere() },
    select: { slug: true },
  });
  return post?.slug ?? null;
}

/** Related posts by shared tags (weighted) and same category, newest first among ties. */
export async function getRelatedPosts(post, take = 3) {
  const candidates = await prisma.blogPost.findMany({
    where: {
      AND: [
        liveWhere(),
        { id: { not: post.id } },
        { OR: [{ category: post.category }, ...(post.tags.length ? [{ tags: { hasSome: post.tags } }] : [])] },
      ],
    },
    select: cardSelect,
    orderBy: { publishedAt: 'desc' },
    take: 30,
  });
  const score = (c) => c.tags.filter((t) => post.tags.includes(t)).length * 2 + (c.category === post.category ? 1 : 0);
  return candidates
    .map((c) => ({ c, s: score(c) }))
    .sort((a, b) => b.s - a.s || b.c.publishedAt - a.c.publishedAt)
    .slice(0, take)
    .map((x) => x.c);
}

export async function getFeedbackCounts(postId) {
  const rows = await prisma.blogFeedback.groupBy({ by: ['helpful'], where: { postId }, _count: { _all: true } });
  const yes = rows.find((r) => r.helpful)?._count._all ?? 0;
  const no = rows.find((r) => !r.helpful)?._count._all ?? 0;
  return { yes, no };
}

export function getComments(postId, take = 100) {
  return prisma.blogComment.findMany({
    where: { postId },
    orderBy: { createdAt: 'desc' },
    take,
    select: { id: true, content: true, createdAt: true, userId: true, user: { select: { name: true, imageUrl: true } } },
  });
}

/** What the signed-in reader has already done on this post. */
export async function getViewerState(postId, userId) {
  if (!userId) return { liked: false, helpful: null };
  const [like, fb] = await Promise.all([
    prisma.blogLike.findUnique({ where: { postId_userId: { postId, userId } }, select: { id: true } }),
    prisma.blogFeedback.findUnique({ where: { postId_userId: { postId, userId } }, select: { helpful: true } }),
  ]);
  return { liked: Boolean(like), helpful: fb ? fb.helpful : null };
}

/** The practice questions an admin attached to a post, in the order they chose. Unpublished problems are skipped. */
export async function getPracticeProblems(ids = []) {
  if (!ids?.length) return [];
  const rows = await prisma.problem.findMany({
    where: { id: { in: ids }, published: true },
    select: { id: true, slug: true, title: true, difficulty: true, type: true, estimatedMinutes: true, topic: { select: { name: true } } },
  });
  const byId = new Map(rows.map((r) => [r.id, r]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
}