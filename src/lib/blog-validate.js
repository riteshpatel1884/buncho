import { CATEGORY_BY_SLUG, KIND_LABEL, LIMITS, RESERVED_SLUGS, RESOURCE_TYPES } from './blog-constants';
import { SLUG_PATTERN, collectImages, countWords, hasCodeBlockWithoutLanguage, safeUrl } from './blog-content';

/**
 * Rules a post must pass before it can go public. The same function runs in the editor (to disable the Publish
 * button and show what is missing) and again on the server (which never trusts the client).
 * Returns { errors, warnings }, each an array of { field, message }.
 */
export function validatePost(post, { now = new Date(), schedule = null } = {}) {
  const errors = [];
  const warnings = [];
  const err = (field, message) => errors.push({ field, message });
  const warn = (field, message) => warnings.push({ field, message });

  const title = (post.title ?? '').trim();
  if (title.length < LIMITS.titleMin) err('title', `Title needs at least ${LIMITS.titleMin} characters.`);
  if (title.length > LIMITS.title) err('title', `Title must be ${LIMITS.title} characters or fewer.`);

  const slug = post.slug ?? '';
  if (!slug || !SLUG_PATTERN.test(slug) || slug.length > LIMITS.slugMax) {
    err('slug', 'Slug must be lowercase words separated by hyphens (letters and numbers only).');
  } else if (RESERVED_SLUGS.includes(slug)) {
    err('slug', `"${slug}" is reserved. Choose another slug.`);
  }

  const excerpt = (post.excerpt ?? '').trim();
  if (excerpt.length < LIMITS.excerptMin || excerpt.length > LIMITS.excerptMax) {
    err('excerpt', `Summary should be ${LIMITS.excerptMin}-${LIMITS.excerptMax} characters (now ${excerpt.length}).`);
  }

  const meta = (post.metaDescription ?? '').trim();
  if (meta.length < LIMITS.metaMin || meta.length > LIMITS.metaMax) {
    err('metaDescription', `Meta description should be ${LIMITS.metaMin}-${LIMITS.metaMax} characters (now ${meta.length}).`);
  }

  const seoTitle = (post.seoTitle ?? '').trim();
  if (seoTitle.length > LIMITS.seoTitleMax + 10) err('seoTitle', `SEO title is too long (${seoTitle.length} characters).`);
  else if (seoTitle.length > LIMITS.seoTitleMax) warn('seoTitle', `SEO title may be cut off in search results (over ${LIMITS.seoTitleMax} characters).`);
  else if (!seoTitle) warn('seoTitle', 'No SEO title set. The article title will be used.');

  const kind = post.kind === 'CODING' ? 'CODING' : 'BLOG';
  const coding = kind === 'CODING';
  const category = CATEGORY_BY_SLUG[post.category];
  if (!category) err('category', 'Choose a category.');
  else if ((category.kind ?? 'BLOG') !== kind) err('category', `This category does not belong to ${KIND_LABEL[kind].toLowerCase()}. Choose another.`);

  const tags = post.tags ?? [];
  if (tags.length < 1) err('tags', 'Add at least one tag.');
  if (tags.length > LIMITS.tagsMax) err('tags', `Use at most ${LIMITS.tagsMax} tags.`);

  // The cover image is optional. If one is set it must be a valid URL, and alt text is recommended.
  if ((post.coverImage ?? '').trim()) {
    if (!safeUrl(post.coverImage, { mailto: false })) err('coverImage', 'The cover image URL is not valid.');
    else if (!(post.coverAlt ?? '').trim()) warn('coverAlt', 'Add alt text for the cover image (good for accessibility and SEO).');
  }

  if (post.canonicalUrl && !/^https:\/\//i.test(post.canonicalUrl.trim())) {
    err('canonicalUrl', 'Canonical URL must be a full https:// address (or leave it empty).');
  }

  const content = post.content;
  const { prose, code } = countWords(content);
  const headings = (content?.content ?? []).filter((n) => n.type === 'heading').length;
  if (coding) {
    // Coding notes are judged on their code as much as their prose
    const minWords = LIMITS.minCodingWords;
    if (prose < minWords) err('content', `Explain the code in at least ${minWords} words of text (now ${prose}).`);
    if (code === 0) err('content', 'Add at least one code block.');
    if (headings === 0) warn('content', 'No headings yet. H2 headings power the outline and the table of contents.');
    if (hasCodeBlockWithoutLanguage(content)) warn('content', 'Some code blocks have no language, so they will not be highlighted properly.');
  } else {
    if (prose < LIMITS.minWords) err('content', `Write at least ${LIMITS.minWords} words (now ${prose}).`);
    if (prose >= LIMITS.minWords && headings === 0) err('content', 'Add at least one H2 section heading.');
  }

  const missingAlt = collectImages(content).filter((img) => !(img.alt ?? '').trim()).length;
  if (missingAlt) err('content', `${missingAlt} image${missingAlt > 1 ? 's are' : ' is'} missing alt text.`);

  for (const r of post.resources ?? []) {
    if (!RESOURCE_TYPES.includes(r.type) || !(r.label ?? '').trim() || !safeUrl(r.url, { mailto: false, relative: false })) {
      err('resources', 'Every resource needs a type, a label and a valid https:// link.');
      break;
    }
  }

  if (!(post.keyTakeaways ?? []).some((t) => t.trim())) warn('keyTakeaways', 'No key takeaways yet. They help readers and search snippets.');
  if (!post.level) warn('level', 'Difficulty level is not set.');

  if (schedule) {
    if (!(schedule instanceof Date) || Number.isNaN(schedule.getTime())) err('scheduledFor', 'Pick a valid date and time.');
    else if (schedule.getTime() <= now.getTime() + 60 * 1000) err('scheduledFor', 'Scheduled time must be in the future.');
  }

  return { errors, warnings };
}

/** Normalises free-form tag input: lowercase, single spaces, no duplicates, trimmed to length. */
export function cleanTags(tags) {
  const out = [];
  for (const t of Array.isArray(tags) ? tags : []) {
    const tag = String(t).toLowerCase().replace(/[^a-z0-9+#. -]/g, '').replace(/\s+/g, ' ').trim().slice(0, 32);
    if (tag && !out.includes(tag)) out.push(tag);
  }
  return out.slice(0, LIMITS.tagsMax);
}