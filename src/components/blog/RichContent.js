import { createElement as h } from 'react';
import { createLowlight, common } from 'lowlight';
import { CALLOUT_VARIANTS } from '@/lib/blog-constants';
import { safeUrl } from '@/lib/blog-content';
import { SITE_URL } from '@/lib/seo';
import CopyCodeButton from './CopyCodeButton';

/*
 * Server-side renderer for the stored article JSON. It builds React elements node by node, so there is no
 * dangerouslySetInnerHTML anywhere and article content cannot inject markup. It is plain server rendering:
 * crawlers get the complete article in the first HTML response.
 */

const lowlight = createLowlight(common);
const ALIGN_CLASS = { center: 'text-center', right: 'text-right', justify: 'text-justify' };
const siteHost = (() => {
  try {
    return new URL(SITE_URL).host;
  } catch {
    return '';
  }
})();

function hastToReact(node, key) {
  if (node.type === 'text') return node.value;
  if (node.type === 'element') {
    const cls = node.properties?.className;
    return h(node.tagName, { key, className: Array.isArray(cls) ? cls.join(' ') : cls }, (node.children ?? []).map((c, i) => hastToReact(c, i)));
  }
  return null;
}

function highlight(code, language) {
  if (!language || language === 'plaintext' || !lowlight.registered(language)) return code;
  try {
    return lowlight.highlight(language, code).children.map((c, i) => hastToReact(c, i));
  } catch {
    return code;
  }
}

const plain = (node) => (node.content ?? []).map((c) => (c.type === 'text' ? c.text : plain(c))).join('');

function renderText(node, key) {
  let el = node.text;
  for (const mark of node.marks ?? []) {
    if (mark.type === 'bold') el = h('strong', { key }, el);
    else if (mark.type === 'italic') el = h('em', { key }, el);
    else if (mark.type === 'underline') el = h('u', { key }, el);
    else if (mark.type === 'strike') el = h('s', { key }, el);
    else if (mark.type === 'code') el = h('code', { key }, el);
    else if (mark.type === 'link') {
      const href = safeUrl(mark.attrs?.href);
      if (!href) continue;
      let external = false;
      try {
        external = /^https?:/i.test(href) && new URL(href).host !== siteHost;
      } catch {
        external = false;
      }
      el = external
        ? h('a', { key, href, target: '_blank', rel: 'noopener noreferrer' }, el)
        : h('a', { key, href }, el);
    }
  }
  return typeof el === 'string' ? el : el;
}

function renderChildren(node, ctx) {
  return (node.content ?? []).map((c, i) => renderNode(c, ctx, i));
}

function renderNode(node, ctx, key) {
  const a = node.attrs ?? {};
  const align = ALIGN_CLASS[a.textAlign];

  switch (node.type) {
    case 'text':
      return renderText(node, key);
    case 'hardBreak':
      return h('br', { key });
    case 'paragraph':
      if (!node.content?.length) return null;
      return h('p', { key, className: align }, renderChildren(node, ctx));
    case 'heading': {
      // Cursor into the heading index built from the same document, so ids match the table of contents
      const entry = ctx.headings[ctx.cursor++];
      const level = a.level ?? 2;
      return h(
        `h${level}`,
        { key, id: entry?.id, className: align },
        renderChildren(node, ctx),
        entry && h('a', { className: 'heading-anchor', href: `#${entry.id}`, 'aria-label': `Link to section: ${entry.text}` }, '#'),
      );
    }
    case 'bulletList':
      return h('ul', { key }, renderChildren(node, ctx));
    case 'orderedList':
      return h('ol', { key, start: a.start > 1 ? a.start : undefined }, renderChildren(node, ctx));
    case 'listItem':
      return h('li', { key }, renderChildren(node, ctx));
    case 'blockquote':
      return h('blockquote', { key }, renderChildren(node, ctx));
    case 'horizontalRule':
      return h('hr', { key });
    case 'codeBlock': {
      const code = plain(node);
      const language = a.language || 'plaintext';
      return h(
        'div',
        { key, className: 'code-block' },
        h(
          'div',
          { className: 'code-block-bar' },
          h('span', { className: 'code-block-lang' }, language),
          h(CopyCodeButton, { code }),
        ),
        h('pre', { tabIndex: 0 }, h('code', { className: `language-${language}` }, highlight(code, language))),
      );
    }
    case 'image': {
      const src = safeUrl(a.src, { mailto: false });
      if (!src) return null;
      return h(
        'figure',
        { key, className: 'blog-figure' },
        h('img', {
          src,
          alt: a.alt ?? '',
          width: a.width || undefined,
          height: a.height || undefined,
          loading: 'lazy',
          decoding: 'async',
        }),
        a.caption ? h('figcaption', null, a.caption) : null,
      );
    }
    case 'table': {
      const rows = node.content ?? [];
      const headerRow = rows[0] && (rows[0].content ?? []).length > 0 && rows[0].content.every((c) => c.type === 'tableHeader');
      const render = (r, i) => renderNode(r, ctx, i);
      return h(
        'div',
        { key, className: 'table-wrap', role: 'region', tabIndex: 0, 'aria-label': 'Table' },
        h('table', null, headerRow ? h('thead', null, render(rows[0], 0)) : null, h('tbody', null, rows.slice(headerRow ? 1 : 0).map((r, i) => render(r, i + 1)))),
      );
    }
    case 'tableRow':
      return h('tr', { key }, renderChildren(node, ctx));
    case 'tableHeader':
    case 'tableCell': {
      const Tag = node.type === 'tableHeader' ? 'th' : 'td';
      return h(
        Tag,
        { key, colSpan: a.colspan > 1 ? a.colspan : undefined, rowSpan: a.rowspan > 1 ? a.rowspan : undefined, scope: Tag === 'th' ? 'col' : undefined },
        renderChildren(node, ctx),
      );
    }
    case 'callout': {
      const variant = CALLOUT_VARIANTS[a.variant] ? a.variant : 'info';
      return h(
        'aside',
        { key, className: `callout callout-${variant}`, role: 'note' },
        h('p', { className: 'callout-title' }, CALLOUT_VARIANTS[variant].label),
        renderChildren(node, ctx),
      );
    }
    default:
      return null;
  }
}

/** `headings` must come from buildHeadingIndex(doc) for the same document. */
export default function RichContent({ doc, headings }) {
  const ctx = { headings, cursor: 0 };
  return <div className="prose-blog">{renderChildren(doc ?? { content: [] }, ctx)}</div>;
}
