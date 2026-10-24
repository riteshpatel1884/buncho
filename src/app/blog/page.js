import BlogIndex from '@/components/blog/BlogIndex';
import JsonLd from '@/components/JsonLd';
import { getPosts, getFeaturedPosts, parseBlogParams } from '@/lib/blog';
import { buildMetadata, breadcrumbJsonLd, blogCollectionJsonLd, graph } from '@/lib/seo';

const TITLE = 'AI, ML & GenAI Blog';
const DESCRIPTION =
  'Practical guides on LLMs, RAG, agents, deep learning and MLOps for AI engineers: production-ready patterns, code you can run and interview-ready explanations.';

export async function generateMetadata({ searchParams }) {
  const { q, tag, page } = parseBlogParams(await searchParams);
  // Search and tag views are thin duplicates of the main list, so keep them out of the index
  if (q || tag) return buildMetadata({ title: TITLE, description: DESCRIPTION, path: '/blog', noindex: true });
  return buildMetadata({
    title: page > 1 ? `${TITLE} (Page ${page})` : TITLE,
    description: DESCRIPTION,
    path: page > 1 ? `/blog?page=${page}` : '/blog',
  });
}

export default async function BlogPage({ searchParams }) {
  const filters = parseBlogParams(await searchParams);
  const showFeatured = !filters.q && !filters.tag && filters.page === 1;
  const featured = showFeatured ? await getFeaturedPosts(3) : [];
  const result = await getPosts({ ...filters, excludeIds: featured.map((f) => f.id) });

  const jsonLd = graph(
    breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }]),
    blogCollectionJsonLd({ name: TITLE, description: DESCRIPTION, path: '/blog', posts: [...featured, ...result.items] }),
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <BlogIndex
        heading="AI, ML and GenAI engineering, explained"
        intro="Production-focused guides on LLMs, RAG, agents and MLOps, with runnable code and the interview-ready reasoning behind it."
        basePath="/blog"
        result={result}
        filters={filters}
        featured={featured}
      />
    </>
  );
}