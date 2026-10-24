import { liveWhere } from '@/lib/blog';
import { prisma } from '@/lib/prisma';
import { SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/seo';

export const revalidate = 3600;

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function GET() {
  const posts = await prisma.blogPost
    .findMany({
      where: liveWhere(),
      orderBy: { publishedAt: 'desc' },
      take: 30,
      select: { slug: true, title: true, excerpt: true, publishedAt: true, lastEditedAt: true, tags: true },
    })
    .catch(() => []);

  const items = posts
    .map(
      (p) => `<item><title>${esc(p.title)}</title><link>${absoluteUrl(`/blog/${p.slug}`)}</link><guid isPermaLink="true">${absoluteUrl(`/blog/${p.slug}`)}</guid><pubDate>${p.publishedAt.toUTCString()}</pubDate><description>${esc(p.excerpt)}</description>${p.tags.map((t) => `<category>${esc(t)}</category>`).join('')}</item>`,
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${esc(SITE_NAME)} Blog</title><link>${SITE_URL}/blog</link><description>AI, ML and GenAI engineering guides</description><language>en</language><atom:link href="${SITE_URL}/blog/feed.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 's-maxage=3600, stale-while-revalidate' } });
}
