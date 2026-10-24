import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdminPage } from '@/lib/blog-admin';
import { effectiveStatus, liveWhere } from '@/lib/blog';
import { CATEGORY_BY_SLUG, POST_STATUSES, STATUS_LABEL } from '@/lib/blog-constants';
import { formatDateTimeIST } from '@/lib/datetime';
import RowActions from '@/components/blog/admin/RowActions';

export const metadata = { title: 'Blog admin' };
export const dynamic = 'force-dynamic';

const BADGE = {
  DRAFT: 'bg-surface-2 text-muted',
  PUBLISHED: 'bg-easy/12 text-easy',
  UNPUBLISHED: 'bg-hard/12 text-hard',
  SCHEDULED: 'bg-medium/12 text-medium',
};

export default async function AdminBlogPage({ searchParams }) {
  await requireAdminPage();
  const sp = await searchParams;
  const q = String(sp.q ?? '').trim().slice(0, 80);
  const status = POST_STATUSES.includes(sp.status) ? sp.status : '';
  const now = new Date();

  const where = {
    ...(q && { OR: [{ title: { contains: q, mode: 'insensitive' } }, { slug: { contains: q, mode: 'insensitive' } }, { tags: { has: q.toLowerCase() } }] }),
    // "Published" in the filter means live now, including scheduled posts whose time has passed
    ...(status === 'PUBLISHED' && liveWhere(now)),
    ...(status === 'SCHEDULED' && { status: 'SCHEDULED', publishedAt: { gt: now } }),
    ...(status === 'DRAFT' && { status: 'DRAFT' }),
    ...(status === 'UNPUBLISHED' && { status: 'UNPUBLISHED' }),
  };

  const [posts, live, drafts, scheduled, viewAgg, likeCount, commentCount, feedback] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 100,
      select: {
        id: true, slug: true, title: true, status: true, category: true, featured: true, publishedAt: true, lastEditedAt: true, views: true,
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.blogPost.count({ where: liveWhere(now) }),
    prisma.blogPost.count({ where: { status: { in: ['DRAFT', 'UNPUBLISHED'] } } }),
    prisma.blogPost.count({ where: { status: 'SCHEDULED', publishedAt: { gt: now } } }),
    prisma.blogPost.aggregate({ _sum: { views: true } }),
    prisma.blogLike.count(),
    prisma.blogComment.count(),
    prisma.blogFeedback.groupBy({ by: ['helpful'], _count: { _all: true } }),
  ]);

  const yes = feedback.find((f) => f.helpful)?._count._all ?? 0;
  const no = feedback.find((f) => !f.helpful)?._count._all ?? 0;
  const stats = [
    ['Live articles', live],
    ['Drafts', drafts],
    ['Scheduled', scheduled],
    ['Total views', (viewAgg._sum.views ?? 0).toLocaleString('en-IN')],
    ['Likes', likeCount],
    ['Comments', commentCount],
    ['Helpful', yes + no ? `${Math.round((yes / (yes + no)) * 100)}%` : '–'],
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Blog</h1>
        <Link href="/admin/blog/new" className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-ink hover:opacity-90">New article</Link>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-line bg-surface p-3">
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="mt-1 text-xl font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-muted">
        Impressions, clicks and CTR come from Google Search Console (Performance, filtered to pages containing /blog/).
      </p>

      <form className="mt-6 flex flex-wrap gap-2" role="search">
        <label htmlFor="admin-q" className="sr-only">Search articles</label>
        <input id="admin-q" name="q" defaultValue={q} placeholder="Search title, slug or tag" className="h-9 w-64 rounded-md border border-line bg-surface px-3 text-sm outline-none focus:border-accent" />
        <label htmlFor="admin-status" className="sr-only">Status</label>
        <select id="admin-status" name="status" defaultValue={status} className="h-9 rounded-md border border-line bg-surface px-2 text-sm">
          <option value="">All statuses</option>
          {POST_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <button type="submit" className="h-9 rounded-md bg-surface-2 px-4 text-sm font-medium hover:bg-line">Filter</button>
      </form>

      <div className="mt-4 overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead className="bg-surface-2 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Article</th>
              <th className="px-3 py-2.5 font-semibold">Status</th>
              <th className="px-3 py-2.5 text-right font-semibold">Views</th>
              <th className="px-3 py-2.5 text-right font-semibold">Likes</th>
              <th className="px-3 py-2.5 text-right font-semibold">Comments</th>
              <th className="px-3 py-2.5 font-semibold">Updated (IST)</th>
              <th className="px-4 py-2.5 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-surface">
            {posts.map((p) => {
              const st = effectiveStatus(p, now);
              const isLive = st === 'PUBLISHED';
              return (
                <tr key={p.id} className="align-top">
                  <td className="px-4 py-3">
                    <Link href={`/admin/blog/${p.id}/edit`} className="font-medium hover:underline">{p.title}</Link>
                    <p className="mt-0.5 text-xs text-muted">/{p.slug}{CATEGORY_BY_SLUG[p.category] && ` · ${CATEGORY_BY_SLUG[p.category].name}`}{p.featured && ' · Featured'}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE[st]}`}>{STATUS_LABEL[st]}</span>
                    {st === 'SCHEDULED' && <p className="mt-1 text-xs text-muted">{formatDateTimeIST(p.publishedAt)}</p>}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{p.views.toLocaleString('en-IN')}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{p._count.likes}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{p._count.comments}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-muted">{formatDateTimeIST(p.lastEditedAt)}</td>
                  <td className="px-4 py-3"><RowActions id={p.id} slug={p.slug} live={isLive} featured={p.featured} /></td>
                </tr>
              );
            })}
            {!posts.length && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-muted">No articles found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
