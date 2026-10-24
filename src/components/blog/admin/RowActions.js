'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { deletePost, setFeatured, unpublishPost } from '@/app/admin/blog/actions';

const btn = 'rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-medium hover:bg-surface-2 disabled:opacity-50';

export default function RowActions({ id, slug, live, featured }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState(null);

  function run(fn, confirmText) {
    if (confirmText && !window.confirm(confirmText)) return;
    setError(null);
    start(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Link href={`/admin/blog/${id}/edit`} className={btn}>Edit</Link>
      <Link href={`/admin/blog/${id}/preview`} className={btn} target="_blank">Preview</Link>
      {live && <Link href={`/blog/${slug}`} className={btn} target="_blank">View</Link>}
      {live && (
        <>
          <button type="button" disabled={pending} className={btn} onClick={() => run(() => setFeatured(id, !featured))}>
            {featured ? 'Unfeature' : 'Feature'}
          </button>
          <button type="button" disabled={pending} className={btn} onClick={() => run(() => unpublishPost(id), 'Unpublish this article? It will disappear from the blog and sitemap.')}>
            Unpublish
          </button>
        </>
      )}
      <button
        type="button"
        disabled={pending}
        className={`${btn} text-hard`}
        onClick={() => run(() => deletePost(id), 'Delete this article permanently, including its comments and revisions?')}
      >
        Delete
      </button>
      {error && <span role="alert" className="text-xs text-hard">{error}</span>}
    </div>
  );
}
