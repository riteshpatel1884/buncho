'use client';

import { useState } from 'react';
import { useEditorState } from '@tiptap/react';
import { CODE_LANGUAGES } from '@/lib/blog-constants';
import { groupQaIntoFaq } from '@/lib/blog-content';
import { safeUrl } from '@/lib/blog-content';

const base = 'inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors disabled:opacity-40';
const on = 'bg-accent-soft text-ink ring-1 ring-accent';
const off = 'hover:bg-surface-2';

function Btn({ active, label, onClick, disabled, children }) {
  return (
    <button type="button" aria-label={label} title={label} aria-pressed={active} disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={onClick} className={`${base} ${active ? on : off}`}>
      {children}
    </button>
  );
}

const Sep = () => <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />;

export default function EditorToolbar({ editor, onImage }) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [href, setHref] = useState('');
  const [linkError, setLinkError] = useState(null);

  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      underline: e.isActive('underline'),
      strike: e.isActive('strike'),
      code: e.isActive('code'),
      link: e.isActive('link'),
      linkHref: e.getAttributes('link').href ?? '',
      heading: [2, 3, 4].find((l) => e.isActive('heading', { level: l })) ?? 0,
      bullet: e.isActive('bulletList'),
      ordered: e.isActive('orderedList'),
      quote: e.isActive('blockquote'),
      codeBlock: e.isActive('codeBlock'),
      faq: e.isActive('faq'),
      language: (e.getAttributes('codeBlock').language ?? '') === 'plaintext' ? '' : e.getAttributes('codeBlock').language || '',
      callout: e.isActive('callout'),
      table: e.isActive('table'),
      image: e.isActive('image'),
      alignCenter: e.isActive({ textAlign: 'center' }),
      alignRight: e.isActive({ textAlign: 'right' }),
      alignLeft: !e.isActive({ textAlign: 'center' }) && !e.isActive({ textAlign: 'right' }),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const chain = () => editor.chain().focus();

  function openLink() {
    setHref(s.linkHref);
    setLinkError(null);
    setLinkOpen(true);
  }
  function applyLink(e) {
    e.preventDefault();
    if (!href.trim()) {
      chain().extendMarkRange('link').unsetLink().run();
    } else {
      const safe = safeUrl(href.startsWith('www.') ? `https://${href}` : href);
      if (!safe) return setLinkError('Use an https:// link, a /path on this site, or mailto:.');
      chain().extendMarkRange('link').setLink({ href: safe }).run();
    }
    setLinkOpen(false);
  }

  function makeFaqs() {
    const { doc, converted } = groupQaIntoFaq(JSON.parse(JSON.stringify(editor.getJSON())));
    if (!converted) return window.alert('No "Q1. question" lines with an answer underneath were found.');
    editor.commands.setContent(doc, { emitUpdate: true });
  }

  function setHeading(value) {
    const level = Number(value);
    if (!level) chain().setParagraph().run();
    else chain().toggleHeading({ level }).run();
  }

  return (
    <div className="sticky top-[calc(4rem+var(--editor-bar-h,3.75rem))] z-20 rounded-t-lg border-b border-line bg-surface">
      <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-0.5 p-1.5">
        <label className="sr-only" htmlFor="heading-select">Text style</label>
        <select id="heading-select" value={s.heading} onChange={(e) => setHeading(e.target.value)} className="h-8 rounded-md border border-line bg-surface px-2 text-sm">
          <option value={0}>Paragraph</option>
          <option value={2}>Heading 2</option>
          <option value={3}>Heading 3</option>
          <option value={4}>Heading 4</option>
        </select>
        <Sep />
        <Btn label="Bold" active={s.bold} onClick={() => chain().toggleBold().run()}><b>B</b></Btn>
        <Btn label="Italic" active={s.italic} onClick={() => chain().toggleItalic().run()}><i>I</i></Btn>
        <Btn label="Underline" active={s.underline} onClick={() => chain().toggleUnderline().run()}><u>U</u></Btn>
        <Btn label="Strikethrough" active={s.strike} onClick={() => chain().toggleStrike().run()}><s>S</s></Btn>
        <Btn label="Inline code" active={s.code} onClick={() => chain().toggleCode().run()}><span className="font-mono text-xs">{'</>'}</span></Btn>
        <Btn label="Link" active={s.link} onClick={openLink}>Link</Btn>
        <Sep />
        <Btn label="Bulleted list" active={s.bullet} onClick={() => chain().toggleBulletList().run()}>• List</Btn>
        <Btn label="Numbered list" active={s.ordered} onClick={() => chain().toggleOrderedList().run()}>1. List</Btn>
        <Btn label="Quote" active={s.quote} onClick={() => chain().toggleBlockquote().run()}>“ ”</Btn>
        <Btn label="Horizontal rule" onClick={() => chain().setHorizontalRule().run()}>—</Btn>
        <Sep />
        <Btn label="Align left" active={s.alignLeft} onClick={() => chain().setTextAlign('left').run()}>⇤</Btn>
        <Btn label="Align center" active={s.alignCenter} onClick={() => chain().setTextAlign('center').run()}>↔</Btn>
        <Btn label="Align right" active={s.alignRight} onClick={() => chain().setTextAlign('right').run()}>⇥</Btn>
        <Sep />
        <Btn label="Code block" active={s.codeBlock} onClick={() => chain().toggleCodeBlock().run()}>Code block</Btn>
        {s.codeBlock && (
          <>
            <label className="sr-only" htmlFor="code-lang">Code language</label>
            <select id="code-lang" value={s.language} onChange={(e) => chain().updateAttributes('codeBlock', { language: e.target.value || null }).run()} className="h-8 rounded-md border border-line bg-surface px-2 text-sm">
              {CODE_LANGUAGES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </>
        )}
        <Btn label="FAQ item: first block is the question, the rest is the answer" active={s.faq} onClick={() => (s.faq ? chain().unsetFaq().run() : chain().setFaq().run())}>FAQ</Btn>
        <Btn label="Turn every 'Q1. question' plus its answer in the article into an FAQ" onClick={makeFaqs}>Q&amp;A → FAQ</Btn>
        <Btn label="Image" active={s.image} onClick={onImage}>Image</Btn>
        <Btn label="Insert table" onClick={() => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>Table</Btn>
        <Sep />
        <label className="sr-only" htmlFor="callout-select">Callout</label>
        <select
          id="callout-select"
          value={s.callout ? editor.getAttributes('callout').variant : ''}
          onChange={(e) => (e.target.value ? (s.callout ? chain().updateAttributes('callout', { variant: e.target.value }).run() : chain().setCallout(e.target.value).run()) : chain().unsetCallout().run())}
          className="h-8 rounded-md border border-line bg-surface px-2 text-sm"
        >
          <option value="">{s.callout ? 'Remove callout' : 'Callout…'}</option>
          <option value="info">Note</option>
          <option value="tip">Tip</option>
          <option value="warning">Warning</option>
        </select>
        <Sep />
        <Btn label="Undo" disabled={!s.canUndo} onClick={() => chain().undo().run()}>↶</Btn>
        <Btn label="Redo" disabled={!s.canRedo} onClick={() => chain().redo().run()}>↷</Btn>
      </div>

      {s.table && (
        <div role="toolbar" aria-label="Table" className="flex flex-wrap items-center gap-1 border-t border-line bg-surface-2 px-2 py-1 text-xs">
          <span className="mr-1 font-semibold text-muted">Table</span>
          {[
            ['Add row below', () => chain().addRowAfter().run()],
            ['Add column right', () => chain().addColumnAfter().run()],
            ['Delete row', () => chain().deleteRow().run()],
            ['Delete column', () => chain().deleteColumn().run()],
            ['Toggle header row', () => chain().toggleHeaderRow().run()],
            ['Delete table', () => chain().deleteTable().run()],
          ].map(([label, fn]) => (
            <button key={label} type="button" onMouseDown={(e) => e.preventDefault()} onClick={fn} className="rounded px-2 py-1 font-medium hover:bg-line">{label}</button>
          ))}
        </div>
      )}

      {s.image && (
        <div className="flex items-center gap-2 border-t border-line bg-surface-2 px-3 py-1 text-xs">
          <span className="font-semibold text-muted">Image selected</span>
          <button type="button" onClick={onImage} className="rounded px-2 py-1 font-medium hover:bg-line">Edit alt text and caption</button>
          <button type="button" onClick={() => chain().deleteSelection().run()} className="rounded px-2 py-1 font-medium text-hard hover:bg-line">Remove</button>
        </div>
      )}

      {linkOpen && (
        <form onSubmit={applyLink} className="flex flex-wrap items-center gap-2 border-t border-line bg-surface-2 px-3 py-2">
          <label htmlFor="link-href" className="text-xs font-medium">Link URL</label>
          <input id="link-href" autoFocus value={href} onChange={(e) => setHref(e.target.value)} placeholder="https://… or /blog/another-post" className="h-8 min-w-[16rem] flex-1 rounded-md border border-line bg-surface px-2 text-sm outline-none focus:border-accent" />
          <button type="submit" className="h-8 rounded-md bg-accent px-3 text-xs font-semibold text-accent-ink">{href.trim() ? 'Apply' : 'Remove link'}</button>
          <button type="button" onClick={() => setLinkOpen(false)} className="h-8 rounded-md px-3 text-xs font-medium hover:bg-line">Cancel</button>
          {linkError && <span role="alert" className="w-full text-xs text-hard">{linkError}</span>}
        </form>
      )}
    </div>
  );
}