import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/seo';
import { liveWhere } from '@/lib/blog';
import { CATEGORY_BY_SLUG } from '@/lib/blog-constants';

// Rebuilt at most once an hour, so new problems show up without hitting the database on every crawl.
export const revalidate = 3600;

// Bump these when the legal text actually changes, so lastModified stays truthful.
const TERMS_UPDATED = new Date('2026-10-22');
const PRIVACY_UPDATED = new Date('2026-10-22');

export default async function sitemap() {
  const now = new Date();
  const entries = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/problems`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/terms`, lastModified: TERMS_UPDATED, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: PRIVACY_UPDATED, changeFrequency: 'yearly', priority: 0.3 },
  ];

  try {
    const [topics, problems] = await Promise.all([
      prisma.topic.findMany({
        select: { slug: true, problems: { where: { published: true }, select: { updatedAt: true }, orderBy: { updatedAt: 'desc' }, take: 1 } },
      }),
      prisma.problem.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    topics.forEach((t) => {
      // A topic with no published problems would render an empty page, so keep it out of the sitemap
      if (!t.problems.length) return;
      entries.push({
        url: `${SITE_URL}/topics/${t.slug}`,
        lastModified: t.problems[0].updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });

    problems.forEach((p) => {
      entries.push({
        url: `${SITE_URL}/problems/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    });

    // Blog: only live posts. Drafts, unpublished and future-scheduled posts never reach this list.
    const posts = await prisma.blogPost.findMany({
      where: liveWhere(),
      select: { slug: true, category: true, coverImage: true, lastEditedAt: true },
      orderBy: { publishedAt: 'desc' },
    });
    const categoryDates = new Map();
    posts.forEach((p) => {
      entries.push({
        url: `${SITE_URL}/blog/${p.slug}`,
        lastModified: p.lastEditedAt,
        changeFrequency: 'monthly',
        priority: 0.7,
        ...(p.coverImage?.startsWith('https://') && { images: [p.coverImage] }),
      });
      const prev = categoryDates.get(p.category);
      if (!prev || p.lastEditedAt > prev) categoryDates.set(p.category, p.lastEditedAt);
    });
    categoryDates.forEach((lastModified, slug) => {
      if (!CATEGORY_BY_SLUG[slug]) return;
      entries.push({ url: `${SITE_URL}/blog/category/${slug}`, lastModified, changeFrequency: 'weekly', priority: 0.6 });
    });
  } catch (err) {
    // If the database is unreachable the static pages are still returned instead of failing the build
    console.error('[sitemap] could not load problems', err);
  }

  return entries;
}