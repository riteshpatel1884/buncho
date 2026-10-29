import { cache } from 'react';
import { prisma } from './prisma';
import { liveWhere } from './blog';
import { BLOG_CATEGORIES, CATEGORY_BY_SLUG } from './blog-constants';

/** Slug used for a coding note that has no category yet (drafts in the editor preview). */
export const UNFILED = 'unfiled';

const file = (r) => ({
  slug: r.slug,
  title: r.title,
  excerpt: r.excerpt ?? '',
  minutes: r.readingMinutes,
  updated: r.lastEditedAt ?? null,
});

/** Link to a folder view on /notes. No arguments = the root. */
export function notesHref(category, folder) {
  const q = new URLSearchParams();
  if (category) q.set('c', category);
  if (category && folder) q.set('f', folder);
  const s = q.toString();
  return s ? `/notes?${s}` : '/notes';
}

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
    select: { slug: true, title: true, excerpt: true, category: true, folder: true, sortOrder: true, readingMinutes: true, lastEditedAt: true },
    orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    take: 1000,
  });
  return buildTree(rows);
});

/**
 * Makes sure the note being viewed is visible in the explorer even when it is not public yet (a draft in the admin
 * preview, or a note with no category). Returns a new tree; the cached one is never changed.
 */
export function withCurrent(tree, post) {
  const slugs = tree.flatMap((c) => [...c.files, ...c.folders.flatMap((f) => f.files)]).map((f) => f.slug);
  if (slugs.includes(post.slug)) return tree;

  const entry = {
    slug: post.slug,
    title: post.title || 'Untitled draft',
    excerpt: post.excerpt ?? '',
    minutes: post.readingMinutes,
    updated: post.lastEditedAt ?? null,
    draft: true,
  };
  const catSlug = CATEGORY_BY_SLUG[post.category]?.kind === 'CODING' ? post.category : UNFILED;
  const copy = tree.map((c) => ({ ...c, files: [...c.files], folders: c.folders.map((f) => ({ ...f, files: [...f.files] })) }));
  let cat = copy.find((c) => c.slug === catSlug);
  if (!cat) {
    const meta = CATEGORY_BY_SLUG[catSlug];
    cat = { slug: catSlug, name: meta?.name ?? 'Unfiled drafts', description: meta?.description ?? 'Notes that have no category yet.', count: 0, files: [], folders: [] };
    copy.push(cat);
  }
  cat.count += 1;
  if (post.folder) {
    let folder = cat.folders.find((f) => f.name === post.folder);
    if (!folder) cat.folders.push((folder = { name: post.folder, files: [] }));
    folder.files.push(entry);
  } else {
    cat.files.push(entry);
  }
  return copy;
}

/** Previous and next file in the same category, in reading order (loose files first, then folder by folder). */
export function neighbours(tree, { slug, category }) {
  const cat = tree.find((c) => c.slug === category);
  if (!cat) return { prev: null, next: null };
  const ordered = [
    ...cat.files.map((f) => ({ ...f, folder: '' })),
    ...cat.folders.flatMap((fo) => fo.files.map((f) => ({ ...f, folder: fo.name }))),
  ];
  const i = ordered.findIndex((f) => f.slug === slug);
  const link = (f) => (f && !f.draft ? f : null);
  return i === -1 ? { prev: null, next: null } : { prev: link(ordered[i - 1]), next: link(ordered[i + 1]) };
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