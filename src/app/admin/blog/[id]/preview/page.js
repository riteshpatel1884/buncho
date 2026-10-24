import Link from 'next/link';
import { notFound } from 'next/navigation';
import ArticleView from '@/components/blog/ArticleView';
import { requireAdminPage } from '@/lib/blog-admin';
import { getPostForAdmin, getRelatedPosts, effectiveStatus } from '@/lib/blog';
import { CATEGORY_BY_SLUG, STATUS_LABEL } from '@/lib/blog-constants';

export const metadata = { title: 'Preview', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

// Renders the real public article layout for any status, only for admins, never indexed.
export default async function PreviewPage({ params }) {
  await requireAdminPage();
  const { id } = await params;
  const raw = await getPostForAdmin(id);
  if (!raw) notFound();

  const post = { ...raw, publishedAt: raw.publishedAt ?? new Date() };
  const related = raw.status === 'DRAFT' ? [] : await getRelatedPosts(post);
  const status = effectiveStatus(raw);

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-line bg-surface/95 px-4 py-2 text-sm backdrop-blur">
        <div className="mx-auto flex max-w-[84rem] flex-wrap items-center justify-between gap-2">
          <p>
            <span className="font-semibold">Preview</span> · {STATUS_LABEL[status]}
            {!CATEGORY_BY_SLUG[post.category] && <span className="text-hard"> · no category yet</span>}
          </p>
          <Link href={`/admin/blog/${id}/edit`} className="font-semibold text-accent underline underline-offset-4">Back to editor</Link>
        </div>
      </div>
      <ArticleView post={post} related={related} preview />
    </>
  );
}
