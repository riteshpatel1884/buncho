import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/seo';

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
  } catch (err) {
    // If the database is unreachable the static pages are still returned instead of failing the build
    console.error('[sitemap] could not load problems', err);
  }

  return entries;
}