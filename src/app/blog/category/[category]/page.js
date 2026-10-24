import { notFound } from 'next/navigation';
import BlogIndex from '@/components/blog/BlogIndex';
import JsonLd from '@/components/JsonLd';
import { CATEGORY_BY_SLUG } from '@/lib/blog-constants';
import { getPosts, getTagCounts, getCategoryCounts, parseBlogParams } from '@/lib/blog';
import { buildMetadata, breadcrumbJsonLd, blogCollectionJsonLd, graph } from '@/lib/seo';

export async function generateMetadata({ params, searchParams }) {
  const category = CATEGORY_BY_SLUG[(await params).category];
  if (!category) return { title: 'Not found', robots: { index: false } };
  const { q, tag, page } = parseBlogParams(await searchParams);
  const path = `/blog/category/${category.slug}`;
  const title = `${category.name} Articles`;
  const description = `${category.description} Guides and tutorials from the Buncho blog.`;
  if (q || tag) return buildMetadata({ title, description, path, noindex: true });
  return buildMetadata({ title: page > 1 ? `${title} (Page ${page})` : title, description, path: page > 1 ? `${path}?page=${page}` : path });
}

export default async function CategoryPage({ params, searchParams }) {
  const category = CATEGORY_BY_SLUG[(await params).category];
  if (!category) notFound();
  const filters = parseBlogParams(await searchParams);
  const path = `/blog/category/${category.slug}`;
  const [result, tags, categoryCounts] = await Promise.all([
    getPosts({ ...filters, category: category.slug }),
    getTagCounts(),
    getCategoryCounts(),
  ]);

  const jsonLd = graph(
    breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }, { name: category.name, path }]),
    blogCollectionJsonLd({ name: `${category.name} articles`, description: category.description, path, posts: result.items }),
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <BlogIndex
        heading={`${category.name} articles`}
        intro={category.description}
        basePath={path}
        activeCategory={category.slug}
        result={result}
        filters={filters}
        tags={tags}
        categoryCounts={categoryCounts}
      />
    </>
  );
}
