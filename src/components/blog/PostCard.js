import Link from 'next/link';
import { CATEGORY_BY_SLUG, LEVEL_LABEL, LEVEL_STYLE } from '@/lib/blog-constants';
import { formatDateIST } from '@/lib/datetime';

export default function PostCard({ post, priority = false, large = false }) {
  const category = CATEGORY_BY_SLUG[post.category];
  return (
    <article className={`group relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-colors hover:border-accent/60 ${large ? 'md:flex-row' : ''}`}>
      <Link href={`/blog/${post.slug}`} tabIndex={-1} aria-hidden="true" className={`block shrink-0 overflow-hidden bg-surface-2 ${large ? 'md:w-[46%]' : ''}`}>
        {post.coverImage ? (
          // Fixed 1200x630 box reserves the space, so cards never shift layout while images load
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt=""
            width={1200}
            height={630}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : undefined}
            decoding="async"
            className="aspect-[1200/630] h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="aspect-[1200/630] w-full" />
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {category && (
            <Link href={`/blog/category/${category.slug}`} className="relative z-10 font-semibold uppercase tracking-wider text-accent hover:underline">
              {category.name}
            </Link>
          )}
          {post.level && <span className={`rounded-full px-2 py-0.5 font-semibold ${LEVEL_STYLE[post.level]}`}>{LEVEL_LABEL[post.level]}</span>}
        </div>
        <h3 className={`mt-2 font-semibold leading-snug tracking-tight ${large ? 'text-2xl' : 'text-lg'}`}>
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 hover:underline">
            {post.title}
          </Link>
        </h3>
        <p className={`mt-2 text-sm leading-relaxed text-muted ${large ? 'line-clamp-4' : 'line-clamp-3'}`}>{post.excerpt}</p>
        <p className="mt-auto pt-4 text-xs text-muted">
          <time dateTime={post.publishedAt.toISOString()}>{formatDateIST(post.publishedAt)}</time> · {post.readingMinutes} min read
        </p>
      </div>
    </article>
  );
}
