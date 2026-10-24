import { notFound, permanentRedirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import ArticleView from '@/components/blog/ArticleView';
import JsonLd from '@/components/JsonLd';
import { getLivePost, getRelatedPosts, getFeedbackCounts, getComments, getViewerState, findSlugRedirect } from '@/lib/blog';
import { getOrCreateUser } from '@/lib/user';
import { isAdmin } from '@/lib/admin';
import { CATEGORY_BY_SLUG, LEVEL_LABEL } from '@/lib/blog-constants';
import { displayName } from '@/lib/community';
import { formatDateTimeIST } from '@/lib/datetime';
import { buildMetadata, blogPostingJsonLd, breadcrumbJsonLd, organizationJsonLd, graph, absoluteUrl, truncate } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getLivePost(slug);
  if (!post) return { title: 'Article not found', robots: { index: false, follow: false } };

  const meta = buildMetadata({
    title: post.seoTitle || post.title,
    description: post.metaDescription || truncate(post.excerpt, 155),
    path: `/blog/${post.slug}`,
    image: post.coverImage || undefined,
    imageAlt: post.coverAlt || post.title,
    type: 'article',
  });
  // Optional canonical override (for example when the article was first published elsewhere)
  if (post.canonicalUrl) meta.alternates = { canonical: post.canonicalUrl };
  meta.openGraph = {
    ...meta.openGraph,
    publishedTime: post.publishedAt.toISOString(),
    modifiedTime: post.lastEditedAt.toISOString(),
    authors: [post.author?.name || 'Buncho'],
    section: CATEGORY_BY_SLUG[post.category]?.name,
    tags: post.tags,
  };
  return meta;
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const post = await getLivePost(slug);
  if (!post) {
    // A renamed article keeps its old URLs alive with a permanent redirect
    const current = await findSlugRedirect(slug);
    if (current) permanentRedirect(`/blog/${current}`);
    notFound();
  }

  const { userId: clerkId } = await auth();
  const user = clerkId ? await getOrCreateUser() : null;
  const admin = isAdmin(user);

  const [related, helpfulCounts, rawComments, viewerState] = await Promise.all([
    getRelatedPosts(post),
    getFeedbackCounts(post.id),
    getComments(post.id),
    getViewerState(post.id, user?.id),
  ]);

  const comments = rawComments.map((c) => ({
    id: c.id,
    content: c.content,
    author: displayName(c.user?.name),
    when: formatDateTimeIST(c.createdAt),
    canDelete: Boolean(user && (c.userId === user.id || admin)),
  }));

  const category = CATEGORY_BY_SLUG[post.category];
  const url = absoluteUrl(`/blog/${post.slug}`);
  const jsonLd = graph(
    organizationJsonLd(),
    blogPostingJsonLd({ ...post, categoryName: category?.name, levelLabel: post.level ? LEVEL_LABEL[post.level] : undefined }, { url, headline: post.title }),
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog' },
      ...(category ? [{ name: category.name, path: `/blog/category/${category.slug}` }] : []),
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <ArticleView
        post={post}
        related={related}
        helpfulCounts={helpfulCounts}
        comments={comments}
        viewer={{ signedIn: Boolean(user), ...viewerState }}
      />
    </>
  );
}
