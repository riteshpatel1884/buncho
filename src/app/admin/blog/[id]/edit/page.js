import { notFound } from 'next/navigation';
import PostEditor from '@/components/blog/admin/PostEditor';
import { requireAdminPage } from '@/lib/blog-admin';
import { getPostForAdmin, isLive } from '@/lib/blog';
import { toISTInputValue } from '@/lib/datetime';
import { getFolderOptions } from '@/lib/notes';

export const metadata = { title: 'Edit article' };
export const dynamic = 'force-dynamic';

export default async function EditPostPage({ params }) {
  await requireAdminPage();
  const post = await getPostForAdmin((await params).id);
  if (!post) notFound();

  // Only plain, serialisable values go to the client component
  const initial = {
    id: post.id,
    kind: post.kind,
    folder: post.folder ?? '',
    sortOrder: post.sortOrder ?? 0,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    tags: post.tags,
    level: post.level ?? '',
    keyTakeaways: post.keyTakeaways,
    resources: Array.isArray(post.resources) ? post.resources : [],
    practiceProblemIds: post.practiceProblemIds ?? [],
    coverImage: post.coverImage ?? '',
    coverAlt: post.coverAlt ?? '',
    seoTitle: post.seoTitle ?? '',
    metaDescription: post.metaDescription ?? '',
    canonicalUrl: post.canonicalUrl ?? '',
    featured: post.featured,
    status: post.status,
    live: isLive(post),
    scheduledFor: post.status === 'SCHEDULED' ? toISTInputValue(post.publishedAt) : '',
    version: post.lastEditedAt.toISOString(),
  };
  const folderOptions = post.kind === 'CODING' ? await getFolderOptions() : {};
  return <PostEditor initial={initial} folderOptions={folderOptions} />;
}