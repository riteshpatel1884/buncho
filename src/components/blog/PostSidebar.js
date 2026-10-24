import Link from 'next/link';
import { LEVEL_LABEL, LEVEL_STYLE } from '@/lib/blog-constants';
import { formatDateTimeIST } from '@/lib/datetime';
import ShareButtons from './ShareButtons';

const card = 'rounded-xl border border-line bg-surface p-4';
const label = 'text-xs font-semibold uppercase tracking-wider text-muted';

// Right-hand column on wide screens; stacks under the article on smaller ones.
export default function PostSidebar({ post, url, related, helpfulCounts }) {
  const edited = post.lastEditedAt && post.publishedAt && post.lastEditedAt.getTime() - post.publishedAt.getTime() > 10 * 60 * 1000;
  const author = post.author?.name || 'Buncho';

  return (
    <div className="space-y-4">
      <section className={card} aria-label="About the author">
        <p className={label}>Author</p>
        <div className="mt-3 flex items-center gap-3">
          {post.author?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.author.imageUrl} alt="" width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
          ) : (
            <span className="grid h-11 w-11 place-items-center rounded-full bg-accent-soft text-lg font-semibold text-accent" aria-hidden="true">
              {author[0]?.toUpperCase()}
            </span>
          )}
          <div>
            <p className="font-semibold leading-tight">{author}</p>
            <p className="text-xs text-muted">Writes about AI engineering on Buncho</p>
          </div>
        </div>
      </section>

      <section className={card} aria-label="Article details">
        <dl className="space-y-3 text-sm">
          <div>
            <dt className={label}>Published</dt>
            <dd className="mt-0.5"><time dateTime={post.publishedAt.toISOString()}>{formatDateTimeIST(post.publishedAt)}</time></dd>
          </div>
          {edited && (
            <div>
              <dt className={label}>Last updated</dt>
              <dd className="mt-0.5"><time dateTime={post.lastEditedAt.toISOString()}>{formatDateTimeIST(post.lastEditedAt)}</time></dd>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 border-t border-line pt-3">
            <div><dt className={label}>Reading time</dt><dd className="mt-0.5">{post.readingMinutes} min</dd></div>
            <div><dt className={label}>Views</dt><dd className="mt-0.5">{post.views.toLocaleString('en-IN')}</dd></div>
            <div><dt className={label}>Likes</dt><dd className="mt-0.5">{post._count.likes}</dd></div>
            <div><dt className={label}>Comments</dt><dd className="mt-0.5"><a href="#comments" className="hover:underline">{post._count.comments}</a></dd></div>
          </div>
          {post.level && (
            <div className="border-t border-line pt-3">
              <dt className={label}>Level</dt>
              <dd className="mt-1"><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${LEVEL_STYLE[post.level]}`}>{LEVEL_LABEL[post.level]}</span></dd>
            </div>
          )}
          {helpfulCounts && helpfulCounts.yes + helpfulCounts.no > 0 && (
            <div className="border-t border-line pt-3">
              <dt className={label}>Found helpful</dt>
              <dd className="mt-0.5">{Math.round((helpfulCounts.yes / (helpfulCounts.yes + helpfulCounts.no)) * 100)}% of {helpfulCounts.yes + helpfulCounts.no} readers</dd>
            </div>
          )}
        </dl>
      </section>

      {post.tags.length > 0 && (
        <section className={card} aria-label="Tags">
          <p className={label}>Tags</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <li key={t}>
                <Link href={`/blog?tag=${encodeURIComponent(t)}`} className="rounded-full bg-surface-2 px-3 py-1 text-xs font-medium hover:bg-line">#{t}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={card} aria-label="Share">
        <p className={label}>Share</p>
        <div className="mt-3"><ShareButtons url={url} title={post.title} /></div>
      </section>

      {related.length > 0 && (
        <section className={card} aria-label="Related articles">
          <p className={label}>Related articles</p>
          <ul className="mt-3 space-y-3">
            {related.map((r) => (
              <li key={r.id}>
                <Link href={`/blog/${r.slug}`} className="text-sm font-medium leading-snug hover:underline">{r.title}</Link>
                <p className="mt-0.5 text-xs text-muted">{r.readingMinutes} min read</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
