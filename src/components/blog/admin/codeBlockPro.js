import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { createLowlight, common } from 'lowlight';
import { parseLineRanges } from '@/lib/blog-content';

const base = createLowlight(common);
const EMPTY = { type: 'root', children: [], data: {} };
const cache = new Map();
const MAX_CACHE = 200;
const MAX_CHARS = 30000;

/*
 * The highlighter TipTap calls after every edit inside a code block. Results are cached per (language, code), so
 * blocks you are not typing in cost a lookup instead of a re-highlight, which keeps long coding n otes snappy.
 * Auto-detection is off in the editor (it tries many languages per keystroke); the public page still auto-detects.
 */
export const lowlight = {
  ...base,
  highlight(language, code) {
    if (code.length > MAX_CHARS) return EMPTY;
    const key = `${language}\0${code}`;
    let hit = cache.get(key);
    if (!hit) {
      hit = base.highlight(language, code);
      if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value);
      cache.set(key, hit);
    }
    return hit;
  },
  highlightAuto: () => EMPTY,
};

/** Tab indents (all selected lines), Shift+Tab outdents. Returns false outside code blocks so Tab keeps its normal job. */
function indent(editor, back) {
  const { state, view } = editor;
  const { $from, $to, empty } = state.selection;
  if ($from.parent.type.name !== 'codeBlock' || $from.parent !== $to.parent) return false;
  const size = editor.storage.codeBlock?.tabSize ?? 2;
  const unit = ' '.repeat(size);
  if (empty && !back) {
    view.dispatch(state.tr.insertText(unit));
    return true;
  }
  const text = $from.parent.textContent;
  const start = $from.start();
  const a = $from.parentOffset;
  const b = $to.parentOffset;
  let s = text.lastIndexOf('\n', a - 1) + 1;
  const starts = [s];
  for (;;) {
    const next = text.indexOf('\n', s);
    if (next === -1) break;
    s = next + 1;
    if (s > b || (s === b && !empty)) break;
    starts.push(s);
  }
  const strip = new RegExp(`^(?: {1,${size}}|\\t)`);
  const tr = state.tr;
  starts.reverse().forEach((from) => {
    const pos = start + from;
    if (!back) tr.insertText(unit, pos);
    else {
      const lead = strip.exec(text.slice(from, from + size))?.[0].length ?? 0;
      if (lead) tr.delete(pos, pos + lead);
    }
  });
  view.dispatch(tr);
  return true;
}

/** Tints the lines listed in a block's "highlight" attribute (for example 2,4-6). Does nothing for blocks without one. */
function lineHighlights() {
  return new Plugin({
    key: new PluginKey('codeLineHighlight'),
    props: {
      decorations(state) {
        const decos = [];
        state.doc.descendants((node, pos) => {
          if (node.type.name !== 'codeBlock') return true;
          if (node.attrs.highlight) {
            const wanted = parseLineRanges(node.attrs.highlight);
            let offset = pos + 1;
            node.textContent.split('\n').forEach((line, i) => {
              if (line && wanted.has(i + 1)) decos.push(Decoration.inline(offset, offset + line.length, { class: 'line-hl' }));
              offset += line.length + 1;
            });
          }
          return false;
        });
        return decos.length ? DecorationSet.create(state.doc, decos) : null;
      },
    },
  });
}

const attr = (name, fallback) => ({
  default: fallback,
  parseHTML: (el) => el.getAttribute(`data-${name}`) ?? fallback,
  renderHTML: (a) => (a[name] && a[name] !== fallback ? { [`data-${name}`]: String(a[name]) } : {}),
});

/** Code block with filename, highlighted lines, line numbers and a code / output / terminal variant. */
export const CodeBlockPro = CodeBlockLowlight.extend({
  addStorage() {
    return { tabSize: 2 };
  },
  addAttributes() {
    return {
      ...this.parent?.(),
      filename: attr('filename', ''),
      highlight: attr('highlight', ''),
      variant: attr('variant', 'code'),
      lineNumbers: {
        default: false,
        parseHTML: (el) => el.getAttribute('data-lines') === 'true',
        renderHTML: (a) => (a.lineNumbers ? { 'data-lines': 'true' } : {}),
      },
    };
  },
  addKeyboardShortcuts() {
    return { ...this.parent?.(), Tab: ({ editor }) => indent(editor, false), 'Shift-Tab': ({ editor }) => indent(editor, true) };
  },
  addProseMirrorPlugins() {
    return [...(this.parent?.() ?? []), lineHighlights()];
  },
});