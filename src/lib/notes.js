import { cache } from 'react';
import { prisma } from './prisma';
import { liveWhere } from './blog';
import { BLOG_CATEGORIES, CATEGORY_BY_SLUG } from './blog-constants';

/** Slug used for a coding note that has no category yet (drafts in the editor preview). */
export const UNFILED = 'unfiled';

/*
 * Structure of the coding notes:
 *   topic folder (a coding category: Python, NumPy, Pandas, SQL ...)  >  note files (one per subtopic)
 * The old free-text "folder" column is kept in the database and is now an optional "section" label on a note
 * (for example "Basics" or "File handling"). It only shows as a small badge; it no longer creates another level.
 */

const file = (r) => ({
  slug: r.slug,
  title: r.title,
  excerpt: r.excerpt ?? '',
  minutes: r.readingMinutes,
  updated: r.lastEditedAt ?? null,
  section: r.folder ?? '',
  order: r.sortOrder ?? 0,
});

/** Notes with an order number (1, 2, 3...) come first in that order, the rest follow by title. */
const byOrder = (a, b) => {
  if (a.order !== b.order) {
    if (!a.order) return 1;
    if (!b.order) return -1;
    return a.order - b.order;
  }
  return a.title.localeCompare(b.title);
};

/** Link to a topic folder on /notes. No argument = the list of all topics. */
export function notesHref(category) {
  return category ? `/notes?c=${encodeURIComponent(category)}` : '/notes';
}

/** Groups published coding notes into topic > files. Topics with no published note are left out. */
export function buildTree(rows) {
  return BLOG_CATEGORIES.filter((c) => c.kind === 'CODING')
    .map((c) => {
      const files = rows.filter((r) => r.category === c.slug).map(file).sort(byOrder);
      return { slug: c.slug, name: c.name, description: c.description, count: files.length, files };
    })
    .filter((c) => c.count > 0);
}

/** The topic tree for the explorer and the /notes page. One small query, shared by everything in a request. */
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
  if (tree.some((c) => c.files.some((f) => f.slug === post.slug))) return tree;

  const entry = {
    slug: post.slug,
    title: post.title || 'Untitled draft',
    excerpt: post.excerpt ?? '',
    minutes: post.readingMinutes,
    updated: post.lastEditedAt ?? null,
    section: post.folder ?? '',
    order: post.sortOrder ?? 0,
    draft: true,
  };
  const catSlug = CATEGORY_BY_SLUG[post.category]?.kind === 'CODING' ? post.category : UNFILED;
  const copy = tree.map((c) => ({ ...c, files: [...c.files] }));
  let cat = copy.find((c) => c.slug === catSlug);
  if (!cat) {
    const meta = CATEGORY_BY_SLUG[catSlug];
    cat = { slug: catSlug, name: meta?.name ?? 'Unfiled drafts', description: meta?.description ?? 'Notes that have no category yet.', count: 0, files: [] };
    copy.push(cat);
  }
  cat.count += 1;
  cat.files.push(entry);
  cat.files.sort(byOrder);
  return copy;
}

/** Previous and next file in the same topic, in reading order. */
export function neighbours(tree, { slug, category }) {
  const cat = tree.find((c) => c.slug === category);
  if (!cat) return { prev: null, next: null };
  const i = cat.files.findIndex((f) => f.slug === slug);
  const link = (f) => (f && !f.draft ? f : null);
  return i === -1 ? { prev: null, next: null } : { prev: link(cat.files[i - 1]), next: link(cat.files[i + 1]) };
}

/**
 * Every coding note per topic (drafts included), for the admin editor: shows the files already inside the chosen
 * topic, suggests the next order number and the section names in use. Admin pages only.
 */
export async function getTopicNotes() {
  const rows = await prisma.blogPost.findMany({
    where: { kind: 'CODING' },
    select: { id: true, title: true, category: true, folder: true, sortOrder: true, status: true },
    orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
    take: 2000,
  });
  const out = {};
  rows.forEach((r) => (out[r.category] ??= []).push({ id: r.id, title: r.title, section: r.folder, order: r.sortOrder, status: r.status }));
  return out;
}