/*
 * Everything that understands the stored article format (TipTap / ProseMirror JSON).
 * Pure functions with no React, Next or database imports, so the admin editor (client), server actions and the
 * public renderer all share exactly the same rules.
 */

export const EMPTY_DOC = { type: 'doc', content: [{ type: 'paragraph' }] };

/* ------------------------------ URLs --------------------------------- */

/**
 * Returns a normalised URL when it is safe to put in href/src, otherwise null.
 * Blocks javascript:, data:, vbscript: and anything else that is not http(s), mailto or a site-relative path.
 */
export function safeUrl(value, { mailto = true, relative = true } = {}) {
  if (typeof value !== 'string') return null;
  const url = value.trim();
  // eslint-disable-next-line no-control-regex
  if (!url || url.length > 2048 || /[\u0000-\u001f\u007f\s]/.test(url)) return null;
  if (url.startsWith('#')) return relative ? url : null;
  if (url.startsWith('/') && !url.startsWith('//')) return relative ? url : null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') return parsed.toString();
    if (mailto && parsed.protocol === 'mailto:') return url;
  } catch {
    return null;
  }
  return null;
}

/* ------------------------------ slugs -------------------------------- */

export function slugify(text = '', max = 80) {
  return String(text)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max)
    .replace(/-+$/, '');
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/* ----------------------------- sanitising ---------------------------- */

const ALIGN = new Set(['left', 'center', 'right', 'justify']);
const NODE_TYPES = new Set([
  'paragraph', 'heading', 'text', 'bulletList', 'orderedList', 'listItem', 'blockquote', 'codeBlock',
  'horizontalRule', 'hardBreak', 'image', 'table', 'tableRow', 'tableHeader', 'tableCell', 'callout', 'faq',
]);
const MARK_TYPES = new Set(['bold', 'italic', 'underline', 'strike', 'code', 'link']);
const CALLOUTS = new Set(['info', 'tip', 'warning', 'pitfall']);
const CODE_VARIANTS = new Set(['code', 'output', 'terminal']);
const LINE_RANGES = /^\d{1,4}(?:-\d{1,4})?(?:,\d{1,4}(?:-\d{1,4})?)*$/;
const MAX_DEPTH = 12;
const MAX_NODES = 30000;

const str = (v, max) => (typeof v === 'string' ? v.replace(/\u0000/g, '').slice(0, max) : '');
const int = (v, min, max) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
};

function cleanMarks(marks) {
  if (!Array.isArray(marks)) return undefined;
  const out = [];
  for (const m of marks) {
    if (!m || !MARK_TYPES.has(m.type)) continue;
    if (m.type === 'link') {
      const href = safeUrl(m.attrs?.href);
      if (href) out.push({ type: 'link', attrs: { href } });
    } else {
      out.push({ type: m.type });
    }
  }
  return out.length ? out : undefined;
}

function cleanAttrs(node) {
  const a = node.attrs ?? {};
  switch (node.type) {
    case 'heading': {
      // H1 is reserved for the article title, so a stray H1 becomes H2
      const level = Math.min(4, Math.max(2, int(a.level, 1, 6) ?? 2));
      return { level, ...(ALIGN.has(a.textAlign) && a.textAlign !== 'left' && { textAlign: a.textAlign }) };
    }
    case 'paragraph':
      return ALIGN.has(a.textAlign) && a.textAlign !== 'left' ? { textAlign: a.textAlign } : undefined;
    case 'orderedList':
      return { start: int(a.start, 1, 100000) ?? 1 };
    case 'codeBlock': {
      const language = typeof a.language === 'string' && /^[a-z0-9+#-]{1,20}$/i.test(a.language) ? a.language.toLowerCase() : null;
      // Optional coding-notes attributes are stored only when they are used, so old posts stay unchanged
      const out = { language };
      const filename = str(a.filename, 80).replace(/[^\w.\-/@+# ]/g, '').trim();
      if (filename) out.filename = filename;
      const highlight = str(a.highlight, 60).replace(/\s/g, '');
      if (highlight && LINE_RANGES.test(highlight)) out.highlight = highlight;
      if (a.lineNumbers === true) out.lineNumbers = true;
      if (CODE_VARIANTS.has(a.variant) && a.variant !== 'code') out.variant = a.variant;
      return out;
    }
    case 'image': {
      const src = safeUrl(a.src, { mailto: false });
      if (!src) return null;
      return {
        src,
        alt: str(a.alt, 300),
        caption: str(a.caption, 300),
        width: int(a.width, 1, 10000),
        height: int(a.height, 1, 10000),
      };
    }
    case 'tableCell':
    case 'tableHeader':
      return {
        colspan: int(a.colspan, 1, 20) ?? 1,
        rowspan: int(a.rowspan, 1, 20) ?? 1,
        colwidth: Array.isArray(a.colwidth) && a.colwidth.every((n) => int(n, 1, 2000)) ? a.colwidth : null,
      };
    case 'callout':
      return { variant: CALLOUTS.has(a.variant) ? a.variant : 'info' };
    default:
      return undefined;
  }
}

/**
 * Rebuilds a document from a whitelist: unknown nodes, marks and attributes are dropped, URLs are checked, H1
 * becomes H2. Run on every save so nothing unexpected is ever stored, whatever the client sent.
 */
export function sanitizeDoc(input) {
  let count = 0;

  function clean(node, depth) {
    if (!node || typeof node !== 'object' || !NODE_TYPES.has(node.type) || depth > MAX_DEPTH) return null;
    if (++count > MAX_NODES) return null;

    if (node.type === 'text') {
      if (typeof node.text !== 'string' || !node.text) return null;
      const marks = cleanMarks(node.marks);
      const t = node.text.replace(/\u0000/g, '').slice(0, 50000);
      if (!t) return null;
      return { type: 'text', text: t, ...(marks && { marks }) };
    }

    const attrs = cleanAttrs(node);
    if (attrs === null) return null; // e.g. an image with an unsafe src

    const out = { type: node.type };
    if (attrs) out.attrs = attrs;

    if (Array.isArray(node.content)) {
      const children = node.content.map((c) => clean(c, depth + 1)).filter(Boolean);
      if (children.length) out.content = children;
    }
    return out;
  }

  const root = input && typeof input === 'object' && input.type === 'doc' ? input : null;
  if (!root || !Array.isArray(root.content)) return { ...EMPTY_DOC };
  const content = root.content.map((c) => clean(c, 1)).filter(Boolean);
  return { type: 'doc', content: content.length ? content : [{ type: 'paragraph' }] };
}

/* ------------------------------ text --------------------------------- */

const BLOCK_NODES = new Set([
  'paragraph', 'heading', 'listItem', 'blockquote', 'codeBlock', 'tableCell', 'tableHeader', 'callout', 'image',
]);

export function nodeText(node) {
  if (!node) return '';
  if (node.type === 'text') return node.text ?? '';
  if (node.type === 'hardBreak') return ' ';
  const inner = (node.content ?? []).map(nodeText).join(BLOCK_NODES.has(node.type) ? '' : ' ');
  return node.type === 'image' ? node.attrs?.alt ?? '' : inner;
}

function walk(node, fn) {
  if (!node) return;
  fn(node);
  (node.content ?? []).forEach((c) => walk(c, fn));
}

/** Plain text of the whole article (code included), for search. */
export function docToText(doc) {
  const parts = [];
  walk(doc, (n) => {
    if (['paragraph', 'heading', 'codeBlock'].includes(n.type)) parts.push(nodeText(n));
  });
  return parts.join('\n').replace(/[ \t]+/g, ' ').trim();
}

const wordCount = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0);

/** Words of prose; code blocks are counted separately because people skim them faster. */
export function countWords(doc) {
  let prose = 0;
  let code = 0;
  walk(doc, (n) => {
    if (n.type === 'codeBlock') code += wordCount(nodeText(n));
    else if (['paragraph', 'heading'].includes(n.type)) prose += wordCount(nodeText(n));
  });
  return { prose, code };
}

/** "2,4-6" becomes Set {2,4,5,6}. Invalid pieces are ignored; capped so a hostile value cannot build a huge set. */
export function parseLineRanges(spec, max = 2000) {
  const out = new Set();
  if (typeof spec !== 'string') return out;
  for (const part of spec.split(',')) {
    const [a, b = a] = part.trim().split('-').map(Number);
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 1) continue;
    for (let n = a; n <= Math.min(b, a + max) && out.size < max; n += 1) out.add(n);
  }
  return out;
}

export function hasCodeBlockWithoutLanguage(doc) {
  let found = false;
  walk(doc, (n) => {
    if (n.type === 'codeBlock' && !n.attrs?.language && (n.attrs?.variant ?? 'code') === 'code') found = true;
  });
  return found;
}

/** Numbers for the coding editor's status bar. */
export function codeStats(doc) {
  let blocks = 0;
  let lines = 0;
  const languages = new Set();
  walk(doc, (n) => {
    if (n.type !== 'codeBlock') return;
    blocks += 1;
    const text = nodeText(n);
    lines += text ? text.split('\n').length : 0;
    if (n.attrs?.language && (n.attrs?.variant ?? 'code') !== 'output') languages.add(n.attrs.language);
  });
  return { ...countWords(doc), blocks, lines, languages: [...languages], minutes: readingMinutes(doc) };
}

export function readingMinutes(doc) {
  const { prose, code } = countWords(doc);
  return Math.max(1, Math.ceil((prose + code * 0.5) / 200));
}

export function collectImages(doc) {
  const out = [];
  walk(doc, (n) => {
    if (n.type === 'image') out.push(n.attrs ?? {});
  });
  return out;
}

/* ----------------------------- headings ------------------------------ */

/**
 * H2-H4 in document order with unique ids. The renderer assigns ids the same way (a cursor into this list), so
 * table-of-contents links always match the headings on the page.
 */
export function buildHeadingIndex(doc) {
  const seen = new Map();
  const out = [];
  walk(doc, (n) => {
    if (n.type !== 'heading') return;
    const text = nodeText(n).trim();
    const base = slugify(text, 60) || 'section';
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    out.push({ id: count ? `${base}-${count + 1}` : base, text, level: n.attrs?.level ?? 2 });
  });
  return out;
}

/** Entries for the sticky table of contents: H2 and H3 only. */
export const tocFromHeadings = (headings) => headings.filter((h) => h.level <= 3 && h.text);

/* -------------------------------- FAQ -------------------------------- */

const QUESTION_START = /^\s*Q(?:uestion)?\s*\d*\s*[.:)\-\u2013]\s*\S/i;
const NOT_ANSWER = new Set(['heading', 'horizontalRule', 'faq']);

/**
 * Turns pasted "Q1. question / answer paragraphs" runs into FAQ blocks (question first, answer after). A run
 * ends at the next question, a heading or a divider. Only top-level blocks are looked at; a question with no
 * answer is left as it is.
 */
export function groupQaIntoFaq(doc) {
  const blocks = doc?.content ?? [];
  const out = [];
  let converted = 0;
  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i];
    if (block.type === 'paragraph' && QUESTION_START.test(nodeText(block))) {
      const answer = [];
      let j = i + 1;
      while (j < blocks.length && !NOT_ANSWER.has(blocks[j].type) && !(blocks[j].type === 'paragraph' && QUESTION_START.test(nodeText(blocks[j])))) {
        answer.push(blocks[j]);
        j += 1;
      }
      if (answer.length) {
        out.push({ type: 'faq', content: [block, ...answer] });
        converted += 1;
        i = j - 1;
        continue;
      }
    }
    out.push(block);
  }
  return { doc: { ...doc, content: out }, converted };
}

/* ------------------------- numbered questions ------------------------ */

const NUMBERED_QUESTION = /^\s*(?:Q\s*)?\d{1,3}\s*[.)]\s+\S.*\?\s*$/i;

/**
 * Turns top-level paragraphs like "1. What is Python?" into H3 headings, so pasted interview notes get an outline,
 * a table of contents and proper question cards. Paragraphs that are not a numbered question are left alone.
 */
export function questionsToHeadings(doc) {
  let converted = 0;
  const content = (doc?.content ?? []).map((block) => {
    if (block.type === 'paragraph' && NUMBERED_QUESTION.test(nodeText(block))) {
      converted += 1;
      return { type: 'heading', attrs: { level: 3 }, content: block.content };
    }
    return block;
  });
  return { doc: { ...doc, content }, converted };
}