import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getOrCreateUser } from '@/lib/user';
import { isAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 5 * 1024 * 1024;
// SVG is deliberately not allowed: it can carry scripts
const TYPES = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif' };

/** Admin-only image upload to Vercel Blob. Needs BLOB_READ_WRITE_TOKEN. Returns { url }. */
export async function POST(req) {
  const user = await getOrCreateUser();
  if (!isAdmin(user)) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'Image storage is not configured (BLOB_READ_WRITE_TOKEN). Paste an image URL instead.' }, { status: 501 });
  }

  let file;
  try {
    file = (await req.formData()).get('file');
  } catch {
    return NextResponse.json({ error: 'Invalid upload.' }, { status: 400 });
  }
  if (!file || typeof file === 'string') return NextResponse.json({ error: 'No file received.' }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: 'Use a PNG, JPEG, WebP, GIF or AVIF image.' }, { status: 415 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Images must be 5 MB or smaller.' }, { status: 413 });

  const base = (file.name || 'image').replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'image';
  const blob = await put(`blog/${new Date().getFullYear()}/${base}.${ext}`, file, { access: 'public', addRandomSuffix: true, contentType: file.type });
  return NextResponse.json({ url: blob.url });
}
