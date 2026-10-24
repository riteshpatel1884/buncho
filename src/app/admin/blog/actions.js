'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { isAdmin } from '@/lib/admin';
import { LEVELS, LIMITS, CATEGORY_BY_SLUG, RESOURCE_TYPES, RESERVED_SLUGS } from '@/lib/blog-constants';
import { docToText, readingMinutes, safeUrl, sanitizeDoc, slugify } from '@/lib/blog-content';
import { cleanTags, validatePost } from '@/lib/blog-validate';
import { formatDateTimeIST } from '@/lib/datetime';

/*
 * Every export here is a public HTTP endpoint, so each one re-checks admin rights on the server. The proxy and the
 * page-level checks are only the first layer.
 */

const fail = (error, extra = {}) => ({ ok: false, error, ...extra });

/** Turns a thrown server error into a readable message (admin-only actions, so showing the cause is safe). */
function crashed(label, err) {
  console.error(`[${label}]`, err);
  const lastLine = String(err?.message ?? err).split('\n').map((l) => l.trim()).filter(Boolean).pop() ?? '';
  return fail(`Server error while ${label} (${err?.code ?? err?.name ?? 'unknown'}): ${lastLine.slice(0, 220)}`);
}
const FORBIDDEN = 'Not allowed.';
const MAX_REVISIONS = 30;
const AUTOSAVE_SNAPSHOT_GAP_MS = 10 * 60 * 1000;

async function requireAdmin() {
  const user = await getOrCreateUser();
  return isAdmin(user) ? user : null;
}

const isLiveStatus = (p) => ['PUBLISHED', 'SCHEDULED'].includes(p.status);

function refresh(post, previous) {
  revalidatePath('/blog');
  revalidatePath('/blog/feed.xml');
  revalidatePath('/sitemap.xml');
  revalidatePath('/admin/blog');
  [post, previous].filter(Boolean).forEach((p) => {
    if (p.slug) revalidatePath(`/blog/${p.slug}`);
    if (p.category) revalidatePath(`/blog/category/${p.category}`);
  });
}

/* ------------------------ input normalisation ------------------------ */

function normalise(input) {
  const text = (v, max) => (typeof v === 'string' ? v.replace(/\u0000/g, '').trim().slice(0, max) : '');
  const list = (v, max, each) =>
    (Array.isArray(v) ? v : []).map((x) => text(x, each)).filter(Boolean).slice(0, max);

  const content = sanitizeDoc(input.content);
  const canonical = safeUrl(input.canonicalUrl, { mailto: false, relative: false });
  const resources = (Array.isArray(input.resources) ? input.resources : [])
    .map((r) => ({ type: RESOURCE_TYPES.includes(r?.type) ? r.type : 'other', label: text(r?.label, 100), url: safeUrl(r?.url, { mailto: false, relative: false }) }))
    .filter((r) => r.label && r.url)
    .slice(0, LIMITS.resourcesMax);

  return {
    title: text(input.title, LIMITS.title),
    slug: slugify(text(input.slug, 120), LIMITS.slugMax),
    excerpt: text(input.excerpt, LIMITS.excerptMax + 50),
    content,
    contentText: docToText(content),
    readingMinutes: readingMinutes(content),
    category: CATEGORY_BY_SLUG[input.category] ? input.category : '',
    tags: cleanTags(input.tags),
    level: LEVELS.includes(input.level) ? input.level : null,
    keyTakeaways: list(input.keyTakeaways, LIMITS.takeawaysMax, 240),
    resources,
    coverImage: safeUrl(input.coverImage, { mailto: false }) ?? null,
    coverAlt: text(input.coverAlt, 300) || null,
    seoTitle: text(input.seoTitle, 100) || null,
    metaDescription: text(input.metaDescription, LIMITS.metaMax + 40) || null,
    canonicalUrl: canonical,
    featured: Boolean(input.featured),
  };
}

async function uniqueSlug(base, excludeId) {
  let slug = RESERVED_SLUGS.includes(base) ? `${base}-post` : base;
  for (let n = 2; n < 50; n += 1) {
    const clash = await prisma.blogPost.findFirst({
      where: { OR: [{ slug }, { previousSlugs: { has: slug } }], ...(excludeId && { id: { not: excludeId } }) },
      select: { id: true },
    });
    if (!clash) return slug;
    slug = `${base}-${n}`.slice(0, LIMITS.slugMax);
  }
  return `${base}-${Date.now().toString(36)}`;
}

async function snapshot(postId, data, opts) {
  // Revision history is a bonus: if it fails, the article itself must still save
  try {
    await snapshotInner(postId, data, opts);
  } catch (err) {
    console.error('[snapshot]', err);
  }
}

async function snapshotInner(postId, data, { force, note = null }) {
  const last = await prisma.blogRevision.findFirst({ where: { postId }, orderBy: { createdAt: 'desc' }, select: { content: true, title: true, createdAt: true } });
  const same = last && last.title === data.title && JSON.stringify(last.content) === JSON.stringify(data.content);
  if (same && !note) return;
  if (!force && last && Date.now() - last.createdAt.getTime() < AUTOSAVE_SNAPSHOT_GAP_MS) return;
  await prisma.blogRevision.create({ data: { postId, title: data.title, content: data.content, note } });
  const old = await prisma.blogRevision.findMany({ where: { postId }, orderBy: { createdAt: 'desc' }, skip: MAX_REVISIONS, select: { id: true } });
  if (old.length) await prisma.blogRevision.deleteMany({ where: { id: { in: old.map((o) => o.id) } } });
}

/* ------------------------------ saving ------------------------------- */

/**
 * Creates or updates a post (never changes its public status). `source` is 'autosave' or 'manual'.
 * `baseVersion` is the lastEditedAt the editor loaded; if someone else saved since, nothing is overwritten.
 */
export async function savePost(input, opts) {
  try {
    return await savePostInner(input, opts);
  } catch (err) {
    return crashed('saving', err);
  }
}

async function savePostInner(input, { source = 'manual', baseVersion = null } = {}) {
  const admin = await requireAdmin();
  if (!admin) return fail(FORBIDDEN);
  if (!input || typeof input !== 'object') return fail('Invalid data.');

  const data = normalise(input);
  if (!data.title) data.title = 'Untitled draft';
  const wantedSlug = data.slug || slugify(data.title) || `draft-${Date.now().toString(36)}`;

  if (!input.id) {
    const slug = await uniqueSlug(wantedSlug, null);
    const created = await prisma.blogPost.create({ data: { ...data, slug, authorId: admin.id, status: 'DRAFT' } });
    await snapshot(created.id, data, { force: true });
    refresh(created);
    return { ok: true, id: created.id, slug: created.slug, version: created.lastEditedAt.toISOString(), savedAt: formatDateTimeIST(created.lastEditedAt) };
  }

  const existing = await prisma.blogPost.findUnique({ where: { id: String(input.id) } });
  if (!existing) return fail('This article no longer exists.');
  if (source === 'autosave' && isLiveStatus(existing)) return fail('Live articles are saved manually.');
  if (baseVersion && existing.lastEditedAt.toISOString() !== baseVersion) {
    return fail('This article was changed somewhere else (another tab or device). Reload before saving so nothing is overwritten.', { conflict: true });
  }

  const slug = data.slug === existing.slug ? existing.slug : await uniqueSlug(wantedSlug, existing.id);
  // Once an article has been public, its old URL keeps redirecting to the new one
  const previousSlugs =
    slug !== existing.slug && existing.publishedAt ? [...new Set([...existing.previousSlugs, existing.slug])].filter((s) => s !== slug) : existing.previousSlugs.filter((s) => s !== slug);

  const now = new Date();
  const updated = await prisma.blogPost.update({
    where: { id: existing.id },
    data: { ...data, slug, previousSlugs, lastEditedAt: now },
  });
  await snapshot(existing.id, data, { force: source === 'manual' });
  if (isLiveStatus(existing)) refresh(updated, existing);
  return { ok: true, id: updated.id, slug: updated.slug, version: updated.lastEditedAt.toISOString(), savedAt: formatDateTimeIST(updated.lastEditedAt) };
}

/* ---------------------- publishing / unpublishing -------------------- */

/** Validates the saved article and makes it public now, or at `scheduledFor` (ISO string). */
export async function publishPost(id, opts) {
  try {
    return await publishPostInner(id, opts);
  } catch (err) {
    return crashed('publishing', err);
  }
}

async function publishPostInner(id, { scheduledFor = null } = {}) {
  const admin = await requireAdmin();
  if (!admin) return fail(FORBIDDEN);
  const post = await prisma.blogPost.findUnique({ where: { id: String(id) } });
  if (!post) return fail('This article no longer exists.');

  const when = scheduledFor ? new Date(scheduledFor) : null;
  const { errors } = validatePost(post, { schedule: when });
  if (errors.length) return fail('Fix these before publishing.', { errors });

  const now = new Date();
  const data = when
    ? { status: 'SCHEDULED', scheduledFor: when, publishedAt: when }
    : { status: 'PUBLISHED', scheduledFor: null, publishedAt: post.publishedAt && ['PUBLISHED', 'UNPUBLISHED'].includes(post.status) ? post.publishedAt : now };

  const updated = await prisma.blogPost.update({ where: { id: post.id }, data });
  await snapshot(post.id, post, { force: true, note: when ? 'Scheduled' : 'Published' });
  refresh(updated);
  return { ok: true, status: updated.status, publishedAt: updated.publishedAt.toISOString() };
}

export async function unpublishPost(id) {
  const admin = await requireAdmin();
  if (!admin) return fail(FORBIDDEN);
  const post = await prisma.blogPost.findUnique({ where: { id: String(id) }, select: { id: true, slug: true, category: true, status: true } });
  if (!post) return fail('This article no longer exists.');
  if (!isLiveStatus(post)) return fail('This article is not published.');
  // A scheduled post that never went live goes back to draft; a live one becomes "unpublished"
  const updated = await prisma.blogPost.update({ where: { id: post.id }, data: { status: post.status === 'SCHEDULED' ? 'DRAFT' : 'UNPUBLISHED', scheduledFor: null } });
  refresh(updated);
  return { ok: true, status: updated.status };
}

export async function setFeatured(id, featured) {
  const admin = await requireAdmin();
  if (!admin) return fail(FORBIDDEN);
  const post = await prisma.blogPost.update({ where: { id: String(id) }, data: { featured: Boolean(featured) }, select: { slug: true, category: true } }).catch(() => null);
  if (!post) return fail('This article no longer exists.');
  refresh(post);
  return { ok: true };
}

export async function deletePost(id) {
  const admin = await requireAdmin();
  if (!admin) return fail(FORBIDDEN);
  const post = await prisma.blogPost.delete({ where: { id: String(id) }, select: { slug: true, category: true } }).catch(() => null);
  if (!post) return fail('This article no longer exists.');
  refresh(post);
  return { ok: true };
}

/* ----------------------------- revisions ----------------------------- */

export async function listRevisions(postId) {
  const admin = await requireAdmin();
  if (!admin) return fail(FORBIDDEN);
  const rows = await prisma.blogRevision.findMany({
    where: { postId: String(postId) },
    orderBy: { createdAt: 'desc' },
    take: MAX_REVISIONS,
    select: { id: true, title: true, note: true, createdAt: true },
  });
  return { ok: true, revisions: rows.map((r) => ({ id: r.id, title: r.title, note: r.note, when: formatDateTimeIST(r.createdAt) })) };
}

/** Returns an old version so the editor can load it. Nothing is written until the admin saves. */
export async function getRevision(postId, revisionId) {
  const admin = await requireAdmin();
  if (!admin) return fail(FORBIDDEN);
  const rev = await prisma.blogRevision.findFirst({ where: { id: String(revisionId), postId: String(postId) }, select: { title: true, content: true } });
  if (!rev) return fail('That version no longer exists.');
  return { ok: true, title: rev.title, content: sanitizeDoc(rev.content) };
}