/** Natural size of an image URL or File, so the public page can reserve its space. Resolves null on failure. */
export function measureImage(src) {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Uploads a File through the admin-only route. Returns { url, width, height } or throws an Error with a readable message. */
export async function uploadImage(file) {
  const body = new FormData();
  body.append('file', file);
  const res = await fetch('/api/admin/blog/upload', { method: 'POST', body });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.url) throw new Error(json.error || 'Upload failed.');
  const size = await measureImage(URL.createObjectURL(file));
  return { url: json.url, width: size?.width ?? null, height: size?.height ?? null };
}
