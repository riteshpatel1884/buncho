import { prisma } from '@/lib/prisma';
import { OG_SIZE, OG_TYPE, renderOg } from '@/lib/og';
import { truncate } from '@/lib/seo';

export const alt = 'Buncho interview questions by topic';
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default async function Image({ params }) {
  const { slug } = await params;
  let t = null;
  try {
    t = await prisma.topic.findUnique({
      where: { slug },
      select: { name: true, description: true, _count: { select: { problems: { where: { published: true } } } } },
    });
  } catch {
    // fall through to the generic card
  }
  if (!t) return renderOg({ eyebrow: 'Interview practice', title: 'AI engineering interview questions', cta: 'Practice this topic' });

  return renderOg({
    eyebrow: 'Topic',
    title: `${t.name} interview questions`,
    subtitle: t.description ? truncate(t.description, 140) : undefined,
    chips: [`${t._count.problems} problems`, 'AI feedback'],
    cta: 'Practice this topic',
  });
}