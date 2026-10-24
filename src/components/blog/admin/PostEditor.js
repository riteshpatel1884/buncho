'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import { buildExtensions } from './extensions';
import EditorToolbar from './EditorToolbar';
import ImageDialog from './ImageDialog';
import PracticePicker from './PracticePicker';
import { Field, ResourcesField, Section, TagInput, inputCls } from './fields';
import { uploadImage } from './upload';
import { savePost, publishPost, unpublishPost, listRevisions, getRevision } from '@/app/admin/blog/actions';
import { BLOG_CATEGORIES, LEVELS, LEVEL_LABEL, LIMITS, RESOURCE_LABEL } from '@/lib/blog-constants';
import { EMPTY_DOC, slugify } from '@/lib/blog-content';
import { validatePost } from '@/lib/blog-validate';
import { fromISTInputValue } from '@/lib/datetime';

/* ProseMirror attrs are null-prototype objects, which React cannot send to a server action (they arrive as
   unusable "temporary client references"). A JSON round trip turns them into plain objects. */
const plain = (doc) => JSON.parse(JSON.stringify(doc));

const AUTOSAVE_MS = 3000;
const blank = {
  id: null, title: '', slug: '', excerpt: '', content: EMPTY_DOC, category: '', tags: [], level: '', keyTakeaways: [],
  resources: [], practiceProblemIds: [], coverImage: '', coverAlt: '', seoTitle: '', metaDescription: '', canonicalUrl: '', featured: false,
  status: 'DRAFT', live: false, scheduledFor: '', version: null,
};

const STATE_TEXT = {
  saved: 'All changes saved',
  unsaved: 'Unsaved changes',
  saving: 'Saving…',
  error: 'Save failed',
  conflict: 'Changed elsewhere',
};
const STATE_DOT = { saved: 'bg-easy', unsaved: 'bg-medium', saving: 'bg-muted', error: 'bg-hard', conflict: 'bg-hard' };

export default function PostEditor({ initial }) {
  const start = initial ?? blank;
  const [form, setForm] = useState(() => ({ ...start }));
  const [doc, setDoc] = useState(start.content);
  const [meta, setMeta] = useState({ id: start.id, status: start.status, live: start.live, version: start.version });
  const [saveState, setSaveState] = useState('saved');
  const [savedAt, setSavedAt] = useState(null);
  const [message, setMessage] = useState(null);
  const [serverErrors, setServerErrors] = useState([]);
  const [slugTouched, setSlugTouched] = useState(Boolean(start.id));
  const [imageOpen, setImageOpen] = useState(false);
  const [imageInitial, setImageInitial] = useState(null);
  const [coverBusy, setCoverBusy] = useState(false);
  const [revisions, setRevisions] = useState(null);
  const [busy, setBusy] = useState(false);

  // Always-current copies for async code (autosave, publish) so it never saves stale values
  const formRef = useRef(form);
  const metaRef = useRef(meta);
  const changeRev = useRef(0);
  const savingRef = useRef(false);
  const timer = useRef(null);
  const markDirtyRef = useRef(() => {});
  const docTimer = useRef(null);
  const rootRef = useRef(null);
  const barRef = useRef(null);
  formRef.current = form;
  metaRef.current = meta;

  const editor = useEditor({
    extensions: buildExtensions(),
    content: start.content,
    immediatelyRender: false, // avoids a hydration mismatch in the Next.js App Router
    editorProps: { attributes: { class: 'prose-blog px-5 py-5', 'aria-label': 'Article content' } },
    onUpdate: ({ editor: e }) => {
      markDirtyRef.current();
      clearTimeout(docTimer.current);
      docTimer.current = setTimeout(() => setDoc(e.getJSON()), 400); // validation does not need every keystroke
    },
  });

  // The site navbar is sticky (4rem). The action bar sticks under it, the formatting toolbar under the action bar.
  // The bar's height changes (wrapping, status messages), so it is measured and shared as a CSS variable.
  useEffect(() => {
    const bar = barRef.current;
    const root = rootRef.current;
    if (!bar || !root || typeof ResizeObserver === 'undefined') return undefined;
    const apply = () => root.style.setProperty('--editor-bar-h', `${bar.offsetHeight}px`);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(bar);
    return () => ro.disconnect();
  }, []);

  const autosaves = !meta.live && ['DRAFT', 'UNPUBLISHED'].includes(meta.status);
  const canAutosave = () => !metaRef.current.live && ['DRAFT', 'UNPUBLISHED'].includes(metaRef.current.status);

  const payload = useCallback(() => ({ ...formRef.current, id: metaRef.current.id, content: editor ? plain(editor.getJSON()) : formRef.current.content }), [editor]);

  /** Saves now. Returns true on success. Autosave and the Save button both come through here. */
  const save = useCallback(
    async (source = 'manual') => {
      if (savingRef.current || !editor) return false;
      savingRef.current = true;
      clearTimeout(timer.current);
      const startedAt = changeRev.current;
      setSaveState('saving');
      setMessage(null);
      const res = await savePost(payload(), { source, baseVersion: metaRef.current.version }).catch(() => ({ ok: false, error: 'Network error. Your edits are still here, try again.' }));
      savingRef.current = false;

      if (!res.ok) {
        setSaveState(res.conflict ? 'conflict' : 'error');
        setMessage(res.error);
        return false;
      }
      setMeta((m) => ({ ...m, id: res.id, version: res.version }));
      metaRef.current = { ...metaRef.current, id: res.id, version: res.version };
      setForm((f) => (f.slug === res.slug ? f : { ...f, slug: res.slug }));
      setSavedAt(res.savedAt);
      if (!initial && typeof window !== 'undefined' && !window.location.pathname.includes(res.id)) {
        // First save of a new article: show the real edit URL without remounting the editor
        window.history.replaceState(null, '', `/admin/blog/${res.id}/edit`);
      }
      // Edits made while the request was in flight are still unsaved
      if (changeRev.current === startedAt) setSaveState('saved');
      else {
        setSaveState('unsaved');
        scheduleAutosave();
      }
      return true;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, payload, initial],
  );

  function scheduleAutosave() {
    clearTimeout(timer.current);
    if (!canAutosave()) return;
    timer.current = setTimeout(() => save('autosave'), AUTOSAVE_MS);
  }

  function markDirty() {
    changeRev.current += 1;
    setSaveState((s) => (s === 'saving' ? s : 'unsaved'));
    scheduleAutosave();
  }

  markDirtyRef.current = markDirty;

  // Warn before leaving with unsaved work
  useEffect(() => {
    const handler = (e) => {
      if (saveState === 'unsaved' || saveState === 'saving' || saveState === 'error') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [saveState]);

  useEffect(() => () => { clearTimeout(timer.current); clearTimeout(docTimer.current); }, []);

  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    markDirty();
  };

  /* ------------------------------ validation ----------------------------- */
  const schedule = form.scheduledFor ? fromISTInputValue(form.scheduledFor) : null;
  const { errors, warnings } = useMemo(
    () => validatePost({ ...form, content: doc }, { schedule: form.scheduledFor ? schedule ?? new Date(NaN) : null }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, doc],
  );
  const err = (field) => errors.find((e) => e.field === field)?.message;
  const canPublish = errors.length === 0 && !busy && saveState !== 'saving';

  /* ------------------------------- actions ------------------------------- */
  async function onSave() {
    setBusy(true);
    await save('manual');
    setBusy(false);
  }

  async function onPreview() {
    setBusy(true);
    const ok = await save('manual');
    setBusy(false);
    if (ok) window.open(`/admin/blog/${metaRef.current.id}/preview`, '_blank');
  }

  async function onPublish() {
    setBusy(true);
    setServerErrors([]);
    if (!(await save('manual'))) return setBusy(false);
    const res = await publishPost(metaRef.current.id, { scheduledFor: schedule ? schedule.toISOString() : null });
    setBusy(false);
    if (!res.ok) {
      setServerErrors(res.errors ?? []);
      return setMessage(res.error);
    }
    setMeta((m) => ({ ...m, status: res.status, live: res.status === 'PUBLISHED' || new Date(res.publishedAt) <= new Date() }));
    setMessage(res.status === 'SCHEDULED' ? 'Scheduled. It goes live automatically at the chosen time.' : 'Published.');
  }

  async function onUnpublish() {
    if (!window.confirm('Unpublish this article? It will disappear from the blog and sitemap.')) return;
    setBusy(true);
    const res = await unpublishPost(metaRef.current.id);
    setBusy(false);
    if (!res.ok) return setMessage(res.error);
    setMeta((m) => ({ ...m, status: res.status, live: false }));
    setForm((f) => ({ ...f, scheduledFor: '' }));
    setMessage('Unpublished.');
  }

  async function loadRevisions() {
    if (!metaRef.current.id) return setRevisions([]);
    const res = await listRevisions(metaRef.current.id);
    setRevisions(res.ok ? res.revisions : []);
  }

  async function restore(revisionId) {
    if (!window.confirm('Replace the current text with this version? You can still undo with Ctrl+Z and nothing is saved until you save.')) return;
    const res = await getRevision(metaRef.current.id, revisionId);
    if (!res.ok) return setMessage(res.error);
    editor.commands.setContent(res.content, true);
    set({ title: res.title });
    setDoc(res.content);
  }

  /* ------------------------------ cover image ---------------------------- */
  async function onCoverFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverBusy(true);
    try {
      const up = await uploadImage(file);
      set({ coverImage: up.url });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setCoverBusy(false);
      e.target.value = '';
    }
  }

  /* ------------------------------ inline image --------------------------- */
  function openImage() {
    const sel = editor.isActive('image') ? editor.getAttributes('image') : null;
    setImageInitial(sel);
    setImageOpen(true);
  }
  function insertImage(attrs) {
    if (editor.isActive('image')) editor.chain().focus().updateAttributes('image', attrs).run();
    else editor.chain().focus().setImage(attrs).run();
    setImageOpen(false);
  }

  const statusLabel = meta.live ? 'Live' : meta.status === 'SCHEDULED' ? 'Scheduled' : meta.status === 'UNPUBLISHED' ? 'Unpublished' : 'Draft';

  return (
    <div ref={rootRef} className="mx-auto w-full max-w-[90rem] px-4 pb-20 sm:px-6">
      {/* Top bar */}
      <div ref={barRef} className="sticky top-16 z-30 -mx-4 mb-6 border-b border-line bg-surface/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/blog" className="text-sm text-muted hover:text-ink">← All articles</Link>
          <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold">{statusLabel}</span>
          <p className="flex items-center gap-2 text-sm" role="status" aria-live="polite">
            <span className={`h-2 w-2 rounded-full ${STATE_DOT[saveState]}`} aria-hidden="true" />
            <span>{STATE_TEXT[saveState]}</span>
            {saveState === 'saved' && savedAt && <span className="hidden text-xs text-muted sm:inline">· {savedAt}</span>}
            {!autosaves && saveState === 'unsaved' && <span className="hidden text-xs text-muted sm:inline">· live articles are saved manually</span>}
          </p>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button type="button" onClick={onSave} disabled={busy || saveState === 'saving' || saveState === 'saved'} className="rounded-md border border-line bg-surface px-3 py-2 text-sm font-medium hover:bg-surface-2 disabled:opacity-50">
              {meta.live ? 'Save changes' : 'Save draft'}
            </button>
            <button type="button" onClick={onPreview} disabled={busy} className="rounded-md border border-line bg-surface px-3 py-2 text-sm font-medium hover:bg-surface-2 disabled:opacity-50">Preview</button>
            {(meta.live || meta.status === 'SCHEDULED') && (
              <button type="button" onClick={onUnpublish} disabled={busy} className="rounded-md border border-line bg-surface px-3 py-2 text-sm font-medium text-hard hover:bg-surface-2 disabled:opacity-50">Unpublish</button>
            )}
            {!meta.live && (
              <button type="button" onClick={onPublish} disabled={!canPublish} title={errors.length ? `${errors.length} item(s) to fix before publishing` : undefined} className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-ink hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
                {schedule ? 'Schedule' : meta.status === 'SCHEDULED' ? 'Update schedule' : 'Publish'}
              </button>
            )}
          </div>
        </div>
        {message && <p role="status" className={`mt-2 text-sm ${saveState === 'error' || saveState === 'conflict' ? 'text-hard' : 'text-muted'}`}>{message}</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Writing column */}
        <div className="min-w-0 space-y-4">
          <div>
            <label htmlFor="post-title" className="sr-only">Article title (H1)</label>
            <textarea
              id="post-title"
              rows={2}
              value={form.title}
              maxLength={LIMITS.title}
              onChange={(e) => {
                const title = e.target.value.replace(/\n/g, ' ');
                set(slugTouched ? { title } : { title, slug: slugify(title) });
              }}
              placeholder="Article title"
              className="w-full resize-none bg-transparent text-3xl font-bold leading-tight tracking-tight outline-none placeholder:text-muted/60"
            />
            {err('title') && form.title && <p className="text-xs text-hard">{err('title')}</p>}
          </div>

          <Field id="post-excerpt" label="Summary (shown under the title and on cards)" count={form.excerpt.length} min={LIMITS.excerptMin} max={LIMITS.excerptMax} error={form.excerpt ? err('excerpt') : null}>
            <textarea id="post-excerpt" rows={2} value={form.excerpt} onChange={(e) => set({ excerpt: e.target.value })} className={inputCls} />
          </Field>

          <div className="blog-editor rounded-lg border border-line bg-surface">
            {editor ? <EditorToolbar editor={editor} onImage={openImage} /> : <div className="h-12" />}
            <EditorContent editor={editor} />
          </div>
          {err('content') && <p className="text-sm text-hard">{err('content')}</p>}

          <PracticePicker value={form.practiceProblemIds ?? []} onChange={(practiceProblemIds) => set({ practiceProblemIds })} />
        </div>

        {/* Settings column */}
        <aside className="min-w-0 space-y-3 lg:sticky lg:top-[calc(4rem+var(--editor-bar-h,3.75rem)+1rem)] lg:max-h-[calc(100dvh-4rem-var(--editor-bar-h,3.75rem)-2rem)] lg:self-start lg:overflow-y-auto lg:pr-1" aria-label="Article settings">
          <Section title={`Publishing checklist (${errors.length ? `${errors.length} to fix` : 'ready'})`}>
            {errors.length === 0 ? (
              <p className="text-sm text-easy">Everything required is filled in.</p>
            ) : (
              <ul className="list-disc space-y-1 pl-5 text-sm text-hard">
                {errors.map((e, i) => <li key={`${e.field}-${i}`}>{e.message}</li>)}
              </ul>
            )}
            {serverErrors.length > 0 && (
              <ul className="list-disc space-y-1 pl-5 text-sm text-hard">{serverErrors.map((e, i) => <li key={i}>Server: {e.message}</li>)}</ul>
            )}
            {warnings.length > 0 && (
              <ul className="list-disc space-y-1 pl-5 text-xs text-muted">{warnings.map((w, i) => <li key={`${w.field}-${i}`}>{w.message}</li>)}</ul>
            )}
          </Section>

          <Section title="Publishing">
            <Field id="post-schedule" label="Schedule for (IST)" hint="Leave empty to publish immediately. India Standard Time, UTC+05:30." error={form.scheduledFor ? err('scheduledFor') : null}>
              <input id="post-schedule" type="datetime-local" value={form.scheduledFor} onChange={(e) => set({ scheduledFor: e.target.value })} className={inputCls} />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.featured} onChange={(e) => set({ featured: e.target.checked })} /> Featured on the blog home page
            </label>
          </Section>

          <Section title="Organisation">
            <Field id="post-category" label="Category" error={err('category')}>
              <select id="post-category" value={form.category} onChange={(e) => set({ category: e.target.value })} className={inputCls}>
                <option value="">Choose…</option>
                {BLOG_CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.group} / {c.name}</option>)}
              </select>
            </Field>
            <Field id="post-tags" label="Tags" hint="Used for search, filters and related articles." error={err('tags')}>
              <TagInput id="post-tags" value={form.tags} onChange={(tags) => set({ tags })} max={LIMITS.tagsMax} />
            </Field>
            <Field id="post-level" label="Difficulty">
              <select id="post-level" value={form.level} onChange={(e) => set({ level: e.target.value })} className={inputCls}>
                <option value="">Not set</option>
                {LEVELS.map((l) => <option key={l} value={l}>{LEVEL_LABEL[l]}</option>)}
              </select>
            </Field>
          </Section>

          <Section title="Cover image (optional, shown on the blog list only)">
            {form.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.coverImage} alt="" className="aspect-[1200/630] w-full rounded-md border border-line object-cover" />
            )}
            <Field id="cover-file" label="Upload (optional, recommended 1200×630)" error={err('coverImage')}>
              <input id="cover-file" type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={onCoverFile} disabled={coverBusy} className="block w-full text-sm" />
            </Field>
            <Field id="cover-url" label="Or image URL">
              <input id="cover-url" value={form.coverImage} onChange={(e) => set({ coverImage: e.target.value })} placeholder="https://" className={inputCls} />
            </Field>
            <Field id="cover-alt" label="Alt text" error={err('coverAlt')}>
              <input id="cover-alt" value={form.coverAlt} onChange={(e) => set({ coverAlt: e.target.value })} maxLength={300} className={inputCls} />
            </Field>
          </Section>

          <Section title="SEO" open>
            <Field id="post-slug" label="URL slug" hint={`/blog/${form.slug || 'your-slug'}${meta.live || form.id ? ' (changing a published slug keeps the old URL redirecting)' : ''}`} error={form.slug ? err('slug') : null}>
              <input id="post-slug" value={form.slug} onChange={(e) => { setSlugTouched(true); set({ slug: slugify(e.target.value, LIMITS.slugMax) }); }} className={inputCls} />
            </Field>
            <Field id="seo-title" label="SEO title" hint="Defaults to the article title. Aim for 60 characters or fewer." count={form.seoTitle.length} max={LIMITS.seoTitleMax} error={err('seoTitle')}>
              <input id="seo-title" value={form.seoTitle} onChange={(e) => set({ seoTitle: e.target.value })} className={inputCls} />
            </Field>
            <Field id="seo-meta" label="Meta description" count={form.metaDescription.length} min={LIMITS.metaMin} max={LIMITS.metaMax} error={form.metaDescription ? err('metaDescription') : null}>
              <textarea id="seo-meta" rows={3} value={form.metaDescription} onChange={(e) => set({ metaDescription: e.target.value })} className={inputCls} />
            </Field>
            <Field id="seo-canonical" label="Canonical URL (optional)" hint="Only if this article was first published elsewhere. Leave empty otherwise." error={err('canonicalUrl')}>
              <input id="seo-canonical" value={form.canonicalUrl} onChange={(e) => set({ canonicalUrl: e.target.value })} placeholder="https://" className={inputCls} />
            </Field>
            <div className="rounded-md bg-surface-2 p-3 text-xs">
              <p className="font-medium text-accent">{form.seoTitle || form.title || 'Article title'} | Buncho</p>
              <p className="mt-0.5 text-muted">buncho.live › blog › {form.slug || 'your-slug'}</p>
              <p className="mt-1 text-muted">{form.metaDescription || 'Your meta description appears here.'}</p>
            </div>
          </Section>

          <Section title="Key takeaways and resources" open={false}>
            <Field id="takeaways" label="Key takeaways (one per line, up to 6)">
              <textarea id="takeaways" rows={4} value={form.keyTakeaways.join('\n')} onChange={(e) => set({ keyTakeaways: e.target.value.split('\n').slice(0, LIMITS.takeawaysMax) })} className={inputCls} />
            </Field>
            <Field id="resources" label="Practical resources" error={err('resources')}>
              <ResourcesField value={form.resources} onChange={(resources) => set({ resources })} types={RESOURCE_LABEL} />
            </Field>
          </Section>

          <Section title="Version history" open={false}>
            {revisions === null ? (
              <button type="button" onClick={loadRevisions} className="rounded-md border border-line px-3 py-1.5 text-xs font-medium hover:bg-surface-2">Load versions</button>
            ) : revisions.length === 0 ? (
              <p className="text-sm text-muted">No saved versions yet.</p>
            ) : (
              <ul className="space-y-2">
                {revisions.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-2 text-xs">
                    <span>{r.when}{r.note && <span className="ml-1 rounded bg-surface-2 px-1.5 py-0.5 text-muted">{r.note}</span>}</span>
                    <button type="button" onClick={() => restore(r.id)} className="rounded-md border border-line px-2 py-1 font-medium hover:bg-surface-2">Restore</button>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </aside>
      </div>

      <ImageDialog open={imageOpen} initial={imageInitial} onClose={() => setImageOpen(false)} onSubmit={insertImage} />
    </div>
  );
}