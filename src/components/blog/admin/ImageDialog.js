'use client';

import { useEffect, useRef, useState } from 'react';
import { safeUrl } from '@/lib/blog-content';
import { measureImage, uploadImage } from './upload';

const input = 'w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent';

// initial: { src, alt, caption, width, height } when editing an existing image, else null
export default function ImageDialog({ open, initial, onClose, onSubmit }) {
  const [src, setSrc] = useState('');
  const [alt, setAlt] = useState('');
  const [caption, setCaption] = useState('');
  const [size, setSize] = useState({ width: null, height: null });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    setSrc(initial?.src ?? '');
    setAlt(initial?.alt ?? '');
    setCaption(initial?.caption ?? '');
    setSize({ width: initial?.width ?? null, height: initial?.height ?? null });
    setError(null);
    ref.current?.showModal();
  }, [open, initial]);

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const up = await uploadImage(file);
      setSrc(up.url);
      setSize({ width: up.width, height: up.height });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  }

  async function submit(e) {
    e.preventDefault();
    const url = safeUrl(src, { mailto: false });
    if (!url) return setError('Upload an image or paste a valid image URL.');
    if (!alt.trim()) return setError('Alt text is required. Describe what the image shows.');
    let dims = size;
    if (!dims.width) dims = (await measureImage(url)) ?? { width: null, height: null };
    onSubmit({ src: url, alt: alt.trim(), caption: caption.trim(), width: dims.width, height: dims.height });
    ref.current?.close();
  }

  if (!open) return null;
  return (
    <dialog ref={ref} onClose={onClose} className="m-auto w-[min(32rem,92vw)] rounded-xl border border-line bg-surface p-0 text-ink backdrop:bg-black/50">
      <form onSubmit={submit} className="space-y-4 p-5">
        <h2 className="text-lg font-semibold">{initial ? 'Edit image' : 'Insert image'}</h2>

        <div>
          <label htmlFor="img-file" className="text-sm font-medium">Upload (PNG, JPEG, WebP, GIF, AVIF, up to 5 MB)</label>
          <input id="img-file" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" onChange={onFile} disabled={busy} className="mt-1 block w-full text-sm" />
        </div>
        <div>
          <label htmlFor="img-url" className="text-sm font-medium">Or image URL</label>
          <input id="img-url" value={src} onChange={(e) => { setSrc(e.target.value); setSize({ width: null, height: null }); }} placeholder="https://" className={`${input} mt-1`} />
        </div>
        {src && safeUrl(src, { mailto: false }) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="max-h-40 rounded-md border border-line object-contain" />
        )}
        <div>
          <label htmlFor="img-alt" className="text-sm font-medium">Alt text <span className="text-hard">*</span></label>
          <input id="img-alt" value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={300} className={`${input} mt-1`} />
        </div>
        <div>
          <label htmlFor="img-caption" className="text-sm font-medium">Caption (optional)</label>
          <input id="img-caption" value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={300} className={`${input} mt-1`} />
        </div>

        {error && <p role="alert" className="text-sm text-hard">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => ref.current?.close()} className="rounded-md border border-line px-4 py-2 text-sm font-medium hover:bg-surface-2">Cancel</button>
          <button type="submit" disabled={busy} className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-ink disabled:opacity-50">
            {busy ? 'Uploading…' : initial ? 'Update image' : 'Insert image'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
