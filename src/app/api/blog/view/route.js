import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { liveWhere } from '@/lib/blog';

export const dynamic = 'force-dynamic';

// Search engines and link-preview crawlers. Real readers, including people arriving from Google, are never matched.
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|headless|lighthouse|curl|wget|python-requests/i;

// Adds 1 to a live post's view counter on every call and returns the new total.
// Only public, published posts can be counted.
export async function POST(req) {
  if (BOT.test(req.headers.get('user-agent') ?? '')) return new NextResponse(null, { status: 204 });

  let slug;
  try {
    ({ slug } = await req.json());
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (typeof slug !== 'string' || slug.length > 120) return new NextResponse(null, { status: 400 });

  try {
    const post = await prisma.blogPost.findFirst({ where: { slug, ...liveWhere() }, select: { id: true } });
    if (!post) return new NextResponse(null, { status: 204 });

    const { views } = await prisma.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } }, // atomic, so simultaneous readers are all counted
      select: { views: true },
    });
    return NextResponse.json({ views }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[blog view]', err);
    return new NextResponse(null, { status: 204 });
  }
}