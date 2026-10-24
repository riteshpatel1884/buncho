import Link from 'next/link';
import { buildHeadingIndex, tocFromHeadings } from '@/lib/blog-content';
import { CATEGORY_BY_SLUG, LEVEL_LABEL, LEVEL_STYLE, RESOURCE_LABEL } from '@/lib/blog-constants';
import { absoluteUrl } from '@/lib/seo';
import { formatDateIST } from '@/lib/datetime';
import Breadcrumbs from './Breadcrumbs';
import RichContent from './RichContent';
import TableOfContents from './TableOfContents';
import ReadingProgress from './ReadingProgress';
import PostSidebar from './PostSidebar';
import Engagement from './Engagement';
import Comments from './Comments';
import ViewTracker from './ViewTracker';

/**
 * The whole article page body. Used by the public route and by the admin preview, so what an editor previews is
 * exactly what readers get. `preview` hides anything that writes data (views, likes, comments).
 */
export default function ArticleView({ post, related = [], viewer = {}, helpfulCounts = { yes: 0, no: 0 }, comments = [], preview = false }) {
  const category = CATEGORY_BY_SLUG[post.category];
  const headings = buildHeadingIndex(post.content);
  const toc = tocFromHeadings(headings);
  const url = absoluteUrl(`/blog/${post.slug}`);
  const author = post.author?.name || 'Buncho';
  const loginHref = `/login?redirect_url=${encodeURIComponent(`/blog/${post.slug}`)}`;
  const resources = Array.isArray(post.resources) ? post.resources : [];

  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
    ...(category ? [{ name: category.name, href: `/blog/category/${category.slug}` }] : []),
    { name: post.title },
  ];

  return (
    <div className="mx-auto w-full max-w-[84rem] px-4 pb-16 pt-6 sm:px-6">
      <ReadingProgress />
      {!preview && <ViewTracker slug={post.slug} />}

      <header className="mx-auto max-w-[46rem] xl:max-w-none xl:pl-[calc(14rem+2rem)]">
        <Breadcrumbs items={crumbs} />
        {category && (
          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-accent">
            {category.group} / {category.name}
          </p>
        )}
        <h1 className="mt-2 max-w-[46rem] text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{post.title}</h1>
        {post.excerpt && <p className="mt-3 max-w-[46rem] text-lg leading-relaxed text-muted">{post.excerpt}</p>}
        <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
          <span className="font-medium text-ink">{author}</span>
          <span aria-hidden="true">•</span>
          <time dateTime={post.publishedAt?.toISOString()}>{post.publishedAt ? formatDateIST(post.publishedAt) : 'Not published yet'}</time>
          <span aria-hidden="true">•</span>
          <span>{post.readingMinutes} min read</span>
          {post.level && (
            <>
              <span aria-hidden="true">•</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${LEVEL_STYLE[post.level]}`}>{LEVEL_LABEL[post.level]}</span>
            </>
          )}
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)] xl:grid-cols-[14rem_minmax(0,46rem)_18rem] xl:justify-center">
        <aside className="lg:row-span-2 lg:self-start xl:row-span-1 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto" aria-label="Table of contents">
          <TableOfContents items={toc} />
        </aside>

        <article className="min-w-0 lg:col-start-2" id="article-body">
          {post.coverImage && (
            <figure className="overflow-hidden rounded-xl border border-line bg-surface-2">
              {/* Dimensions reserve the space (no layout shift); eager + high priority because it is the LCP element */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverImage}
                alt={post.coverAlt || ''}
                width={1200}
                height={630}
                fetchPriority="high"
                decoding="async"
                className="aspect-[1200/630] w-full object-cover"
              />
            </figure>
          )}

          {post.keyTakeaways?.length > 0 && (
            <section aria-labelledby="takeaways-heading" className="mt-8 rounded-xl border border-line bg-accent-soft/50 p-5">
              <h2 id="takeaways-heading" className="text-sm font-semibold uppercase tracking-wider text-accent">Key takeaways</h2>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[0.95rem] leading-relaxed">
                {post.keyTakeaways.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </section>
          )}

          <div className="mt-8">
            <RichContent doc={post.content} headings={headings} />
          </div>

          {resources.length > 0 && (
            <section aria-labelledby="resources-heading" className="mt-10 rounded-xl border border-line bg-surface p-5">
              <h2 id="resources-heading" className="text-lg font-semibold">Practical resources</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {resources.map((r) => (
                  <li key={r.url} className="flex flex-wrap items-baseline gap-2">
                    <span className="rounded bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">{RESOURCE_LABEL[r.type] ?? 'Link'}</span>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-medium text-accent underline underline-offset-4">{r.label}</a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!preview ? (
            <>
              <Engagement
                postId={post.id}
                signedIn={Boolean(viewer.signedIn)}
                loginHref={loginHref}
                liked={Boolean(viewer.liked)}
                likes={post._count.likes}
                helpful={viewer.helpful ?? null}
                yes={helpfulCounts.yes}
                no={helpfulCounts.no}
              />
              <Comments postId={post.id} initial={comments} signedIn={Boolean(viewer.signedIn)} loginHref={loginHref} />
            </>
          ) : (
            <p className="mt-12 rounded-lg border border-dashed border-line p-4 text-sm text-muted">
              Likes, feedback and comments appear here once the article is live.
            </p>
          )}

          <p className="mt-10 text-sm text-muted">
            Practising for an AI or ML interview? <Link href="/problems" className="font-semibold text-accent underline underline-offset-4">Try the interview questions</Link> and get AI feedback on your answers.
          </p>
        </article>

        <aside className="lg:col-start-2 xl:col-start-3 xl:row-start-1 xl:sticky xl:top-20 xl:self-start" aria-label="Article information">
          <PostSidebar post={post} url={url} related={related} helpfulCounts={helpfulCounts} />
        </aside>
      </div>
    </div>
  );
}
