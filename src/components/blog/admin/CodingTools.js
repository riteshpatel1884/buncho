'use client';

/*
 * Everything that only the coding-notes editor needs. PostEditor loads this file with next/dynamic, so blog
 * articles never download it, and the coding editor paints first and gets these tools a moment later.
 */
import { useEffect, useMemo, useState } from 'react';
import { useEditorState } from '@tiptap/react';
import { CALLOUT_VARIANTS, CODE_LANGUAGES, CODE_VARIANTS } from '@/lib/blog-constants';
import { buildHeadingIndex, codeStats, questionsToHeadings } from '@/lib/blog-content';
import { CODING_TEMPLATES } from '@/lib/coding-templates';

const KEY = 'buncho.codingPrefs.v1';
const DEFAULTS = { size: 'md', wrap: false, tab: 2, lang: 'python', numbers: true };
const pill = 'inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-xs font-semibold transition-colors hover:border-accent/60 hover:bg-accent-soft disabled:opacity-40';
const pillOn = 'border-accent bg-accent-soft';
const field = 'h-8 rounded-md border border-line bg-surface px-2 text-xs outline-none focus:border-accent';

/** Editor preferences live in this browser only. They are applied as data attributes, so changing one never re-renders the document. */
function usePrefs(editor) {
  const [prefs, setPrefs] = useState(() => {
    try {
      return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
    } catch {
      return DEFAULTS;
    }
  });
  useEffect(() => {
    const el = editor.view.dom.closest('.blog-editor');
    if (el) {
      el.dataset.size = prefs.size;
      el.dataset.wrap = prefs.wrap ? 'on' : 'off';
      el.style.setProperty('--tab', String(prefs.tab));
    }
    editor.storage.codeBlock.tabSize = prefs.tab;
    try {
      localStorage.setItem(KEY, JSON.stringify(prefs));
    } catch {
      /* private mode: preferences just last for this visit */
    }
  }, [editor, prefs]);
  return [prefs, (patch) => setPrefs((p) => ({ ...p, ...patch }))];
}

function Menu({ label, children, wide }) {
  return (
    <details className="relative">
      <summary className={`${pill} cursor-pointer list-none marker:hidden`}>{label} <span aria-hidden="true" className="text-muted">⌄</span></summary>
      <div className={`absolute left-0 top-full z-30 mt-1 rounded-lg border border-line bg-surface p-2 shadow-lg ${wide ? 'w-72' : 'w-56'}`}>{children}</div>
    </details>
  );
}

const closeMenu = (e) => e.currentTarget.closest('details')?.removeAttribute('open');

export function CodingBar({ editor, zen, onZen }) {
  const [prefs, setPref] = usePrefs(editor);
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      const a = e.getAttributes('codeBlock');
      return {
        code: e.isActive('codeBlock'),
        language: a.language ?? '',
        filename: a.filename ?? '',
        highlight: a.highlight ?? '',
        variant: a.variant || 'code',
        lineNumbers: Boolean(a.lineNumbers),
        faq: e.isActive('faq'),
        callout: e.isActive('callout') ? e.getAttributes('callout').variant : '',
      };
    },
  });

  const chain = () => editor.chain().focus();
  const setAttrs = (attrs) => editor.chain().updateAttributes('codeBlock', attrs).run(); // no focus(): keeps the cursor in the input

  function insertCode(variant) {
    if (s.code && s.variant === variant) return chain().toggleCodeBlock().run();
    const attrs = {
      variant,
      language: variant === 'terminal' ? 'bash' : variant === 'output' ? null : prefs.lang,
      lineNumbers: variant === 'code' && prefs.numbers,
    };
    return s.code ? chain().updateAttributes('codeBlock', attrs).run() : chain().setCodeBlock(attrs).run();
  }

  const codeAttrs = () => ({ language: prefs.lang, lineNumbers: prefs.numbers });

  /** Inserts the clipboard as one code block with its indentation intact (pasting into normal text loses it). */
  async function pasteAsCode() {
    try {
      const text = (await navigator.clipboard.readText()).replace(/\r\n/g, '\n').replace(/\n+$/, '');
      if (!text.trim()) return;
      chain().insertContent({ type: 'codeBlock', attrs: codeAttrs(), content: [{ type: 'text', text }] }).run();
    } catch {
      window.alert('The browser blocked clipboard access. Allow it for this site, or paste inside an existing code block.');
    }
  }

  /** Several selected paragraphs (code that was pasted line by line) become a single code block, one line each. */
  function mergeToCode() {
    const { state } = editor;
    const { $from, $to } = state.selection;
    if ($from.depth < 1) return;
    const start = $from.before(1);
    const end = $to.after(1);
    const lines = [];
    state.doc.nodesBetween(start, end, (n) => {
      if (n.isTextblock) {
        lines.push(n.textContent);
        return false;
      }
      return true;
    });
    const text = lines.join('\n');
    if (!text.trim()) return;
    chain().insertContentAt({ from: start, to: end }, { type: 'codeBlock', attrs: codeAttrs(), content: [{ type: 'text', text }] }).run();
  }

  function questionsToH3() {
    const { doc, converted } = questionsToHeadings(JSON.parse(JSON.stringify(editor.getJSON())));
    if (!converted) return window.alert('No numbered questions ending in "?" were found, for example "1. What is Python?".');
    editor.commands.setContent(doc, { emitUpdate: true });
  }

  return (
    <div className="border-t border-line bg-surface-2/60">
      <div role="toolbar" aria-label="Coding tools" className="flex flex-wrap items-center gap-1.5 px-2 py-1.5">
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertCode('code')} className={`${pill} ${s.code && s.variant === 'code' ? pillOn : ''}`}>{'</>'} Code</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertCode('output')} className={`${pill} ${s.variant === 'output' && s.code ? pillOn : ''}`}>▷ Output</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertCode('terminal')} className={`${pill} ${s.variant === 'terminal' && s.code ? pillOn : ''}`}>$ Terminal</button>
        <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
        <label className="sr-only" htmlFor="coding-callout">Callout</label>
        <select
          id="coding-callout"
          value={s.callout}
          onChange={(e) => (e.target.value ? (s.callout ? chain().updateAttributes('callout', { variant: e.target.value }).run() : chain().setCallout(e.target.value).run()) : chain().unsetCallout().run())}
          className={`${field} h-8 rounded-full px-3 font-semibold`}
        >
          <option value="">{s.callout ? 'Remove callout' : 'Callout…'}</option>
          {Object.entries(CALLOUT_VARIANTS).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
        </select>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => (s.faq ? chain().unsetFaq().run() : chain().setFaq().run())} className={`${pill} ${s.faq ? pillOn : ''}`} title="First block is the title, the rest folds away">▸ Collapsible</button>

        <Menu label="⚒ Fix pasted notes" wide>
          {[
            ['Paste clipboard as code', 'Keeps indentation exactly as copied', pasteAsCode],
            ['Selected lines → one code block', 'For code that landed as separate paragraphs', mergeToCode],
            ['Numbered questions → headings', '“1. What is Python?” becomes an H3', questionsToH3],
          ].map(([name, hint, fn]) => (
            <button key={name} type="button" onClick={(e) => { fn(); closeMenu(e); }} className="block w-full rounded-md px-2.5 py-2 text-left hover:bg-surface-2">
              <span className="block text-sm font-semibold">{name}</span>
              <span className="block text-xs text-muted">{hint}</span>
            </button>
          ))}
        </Menu>

        <Menu label="✦ Templates" wide>
          {CODING_TEMPLATES.map((tpl) => (
            <button key={tpl.id} type="button" onClick={(e) => { chain().insertContent(tpl.content).run(); closeMenu(e); }} className="block w-full rounded-md px-2.5 py-2 text-left hover:bg-surface-2">
              <span className="block text-sm font-semibold">{tpl.name}</span>
              <span className="block text-xs text-muted">{tpl.hint}</span>
            </button>
          ))}
        </Menu>

        <div className="ml-auto flex items-center gap-1.5">
          <Menu label="Aa View" wide>
            <div className="space-y-3 p-1 text-xs">
              <div>
                <p className="mb-1 font-semibold">Code size</p>
                <div className="flex gap-1">{['sm', 'md', 'lg'].map((v) => <button key={v} type="button" onClick={() => setPref({ size: v })} className={`${pill} flex-1 justify-center ${prefs.size === v ? pillOn : ''}`}>{v === 'sm' ? 'Small' : v === 'md' ? 'Medium' : 'Large'}</button>)}</div>
              </div>
              <div>
                <p className="mb-1 font-semibold">Tab size</p>
                <div className="flex gap-1">{[2, 4].map((v) => <button key={v} type="button" onClick={() => setPref({ tab: v })} className={`${pill} flex-1 justify-center ${prefs.tab === v ? pillOn : ''}`}>{v} spaces</button>)}</div>
              </div>
              <label className="flex items-center gap-2"><input type="checkbox" checked={prefs.wrap} onChange={(e) => setPref({ wrap: e.target.checked })} /> Wrap long code lines</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={prefs.numbers} onChange={(e) => setPref({ numbers: e.target.checked })} /> Line numbers on new code blocks</label>
              <label className="block">
                <span className="mb-1 block font-semibold">Default language</span>
                <select value={prefs.lang} onChange={(e) => setPref({ lang: e.target.value })} className={`${field} w-full`}>
                  {CODE_LANGUAGES.filter(([v]) => v).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </label>
            </div>
          </Menu>
          <button type="button" onClick={() => onZen(!zen)} aria-pressed={zen} className={`${pill} ${zen ? pillOn : ''}`} title="Hide the settings column and write full width">⤢ Focus</button>
        </div>
      </div>

      {s.code && (
        <div className="flex flex-wrap items-center gap-2 border-t border-accent/30 bg-accent-soft/60 px-3 py-2 text-xs">
          <span className="font-semibold text-accent">Code block</span>
          <label className="sr-only" htmlFor="cb-variant">Block type</label>
          <select id="cb-variant" value={s.variant} onChange={(e) => setAttrs({ variant: e.target.value })} className={field}>
            {Object.entries(CODE_VARIANTS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          {s.variant !== 'output' && (
            <>
              <label className="sr-only" htmlFor="cb-lang">Language</label>
              <select id="cb-lang" value={s.language} onChange={(e) => setAttrs({ language: e.target.value || null })} className={field}>
                {CODE_LANGUAGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </>
          )}
          <label className="sr-only" htmlFor="cb-file">File name</label>
          <input id="cb-file" value={s.filename} maxLength={80} onChange={(e) => setAttrs({ filename: e.target.value })} placeholder="File name, e.g. main.py" className={`${field} w-44`} />
          <label className="sr-only" htmlFor="cb-hl">Highlight lines</label>
          <input id="cb-hl" value={s.highlight} maxLength={60} onChange={(e) => setAttrs({ highlight: e.target.value.replace(/[^\d,-]/g, '') })} placeholder="Highlight lines: 2,4-6" className={`${field} w-40`} />
          <label className="flex items-center gap-1.5 font-medium"><input type="checkbox" checked={s.lineNumbers} onChange={(e) => setAttrs({ lineNumbers: e.target.checked })} /> Line numbers</label>
          <span className="ml-auto hidden text-muted md:inline">Tab indents · Shift+Tab outdents · Ctrl+Enter leaves the block</span>
        </div>
      )}
    </div>
  );
}

/** Jump list of the headings in the note. */
export function Outline({ doc, editor }) {
  const items = useMemo(() => buildHeadingIndex(doc).map((h, i) => ({ ...h, i })).filter((h) => h.text), [doc]);
  if (!items.length) return <p className="text-sm text-muted">Add H2 or H3 headings and they appear here as a jump list.</p>;
  const jump = (i) => editor.view.dom.querySelectorAll('h2, h3, h4')[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return (
    <ol className="space-y-0.5 text-sm">
      {items.map((h) => (
        <li key={h.id} style={{ paddingLeft: `${(h.level - 2) * 0.9}rem` }}>
          <button type="button" onClick={() => jump(h.i)} className="w-full truncate rounded px-2 py-1 text-left hover:bg-surface-2" title={h.text}>{h.text}</button>
        </li>
      ))}
    </ol>
  );
}

/** Live counts under the editor. Reads the debounced document, so typing is never blocked by it. */
export function StatsBar({ doc }) {
  const st = useMemo(() => codeStats(doc), [doc]);
  const item = (n, label) => <span><b className="tabular-nums text-ink">{n}</b> {label}</span>;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-b-lg border-t border-line bg-surface-2/60 px-4 py-2 text-xs text-muted" role="status">
      {item(st.prose, 'words')}
      {item(st.blocks, st.blocks === 1 ? 'code block' : 'code blocks')}
      {item(st.lines, 'code lines')}
      {item(st.minutes, 'min read')}
      {st.languages.length > 0 && <span className="ml-auto">{st.languages.join(' · ')}</span>}
    </div>
  );
}

/** One-time tips card. Dismissed for good once closed. */
export function CodingTips() {
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem('buncho.codingTips') !== 'off';
    } catch {
      return true;
    }
  });
  if (!open) return null;
  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem('buncho.codingTips', 'off');
    } catch {
      /* ignore */
    }
  };
  return (
    <div className="flex items-start gap-3 rounded-lg border border-accent/30 bg-accent-soft/50 p-3 text-sm">
      <p className="flex-1 leading-relaxed">
        <b>Quick tips.</b> Type <code className="rounded bg-surface px-1">```python</code> then a space to start a code block. Use <b>Templates</b> for a ready outline, <b>Output</b> to show what code prints, and the block settings bar for file names, highlighted lines and line numbers.
      </p>
      <button type="button" onClick={close} className="rounded px-2 py-1 text-xs font-semibold hover:bg-surface" aria-label="Dismiss tips">Got it</button>
    </div>
  );
}