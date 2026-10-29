import { cache } from 'react';
import { prisma } from './prisma';
import { liveWhere } from './blog';
import { BLOG_CATEGORIES } from './blog-constants';

const file = (r) => ({ slug: r.slug, title: r.title, minutes: r.readingMinutes });

/** Groups published coding notes into category > folder > file. Rows must already be sorted. */
export function buildTree(rows) {
  return BLOG_CATEGORIES.filter((c) => c.kind === 'CODING')
    .map((c) => {
      const mine = rows.filter((r) => r.category === c.slug);
      const names = [...new Set(mine.filter((r) => r.folder).map((r) => r.folder))].sort((a, b) => a.localeCompare(b));
      return {
        slug: c.slug,
        name: c.name,
        description: c.description,
        count: mine.length,
        files: mine.filter((r) => !r.folder).map(file),
        folders: names.map((name) => ({ name, files: mine.filter((r) => r.folder === name).map(file) })),
      };
    })
    .filter((c) => c.count > 0);
}

/** The folder tree for the sidebar and the /notes page. One small query, shared by everything in a request. */
export const getNotesTree = cache(async () => {
  const rows = await prisma.blogPost.findMany({
    where: { AND: [liveWhere(), { kind: 'CODING' }] },
    select: { slug: true, title: true, category: true, folder: true, sortOrder: true, readingMinutes: true },
    orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    take: 1000,
  });
  return buildTree(rows);
});

/** Previous and next file in the same category, in reading order (loose files first, then folder by folder). */
export function neighbours(tree, post) {
  const cat = tree.find((c) => c.slug === post.category);
  if (!cat) return { prev: null, next: null };
  const ordered = [
    ...cat.files.map((f) => ({ ...f, folder: '' })),
    ...cat.folders.flatMap((fo) => fo.files.map((f) => ({ ...f, folder: fo.name }))),
  ];
  const i = ordered.findIndex((f) => f.slug === post.slug);
  return i === -1 ? { prev: null, next: null } : { prev: ordered[i - 1] ?? null, next: ordered[i + 1] ?? null };
}

/** Existing folder names per category (drafts included) for the editor's suggestion list. Admin pages only. */
export async function getFolderOptions() {
  const rows = await prisma.blogPost.findMany({
    where: { kind: 'CODING', NOT: { folder: '' } },
    distinct: ['category', 'folder'],
    select: { category: true, folder: true },
  });
  const out = {};
  rows.forEach((r) => (out[r.category] ??= []).push(r.folder));
  Object.values(out).forEach((list) => list.sort((a, b) => a.localeCompare(b)));
  return out;
}