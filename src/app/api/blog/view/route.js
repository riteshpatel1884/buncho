import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { liveWhere } from '@/lib/blog';

export const dynamic = 'force-dynamic';

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|curl|wget|python-requests/i;

// Increments the view counter of a live post. Only public, published posts can be counted.
export async function POST(req) {
  if (BOT.test(req.headers.get('user-agent') ?? '')) return new NextResponse(null, { status: 204 });
  let slug;
  try {
    ({ slug } = await req.json());
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (typeof slug !== 'string' || slug.length > 120) return new NextResponse(null, { status: 400 });

  await prisma.blogPost
    .updateMany({ where: { slug, ...liveWhere() }, data: { views: { increment: 1 } } })
    .catch((err) => console.error('[blog view]', err));
  return new NextResponse(null, { status: 204 });
}
