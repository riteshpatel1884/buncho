import { prisma } from '@/lib/prisma';
import { DIFFICULTY_LABEL } from '@/lib/constants';
import { OG_SIZE, OG_TYPE, renderOg } from '@/lib/og';
import { truncate } from '@/lib/seo';

export const alt = 'Buncho interview practice problem';
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default async function Image({ params }) {
  const { slug } = await params;
  let p = null;
  try {
    p = await prisma.problem.findFirst({
      where: { slug, published: true },
      select: { title: true, difficulty: true, estimatedMinutes: true, isChallenge: true, topic: { select: { name: true } } },
    });
  } catch {
    // fall through to the generic card
  }
  if (!p) return renderOg({ eyebrow: 'Interview practice', title: 'AI engineering interview question', cta: 'Try this question' });

  return renderOg({
    eyebrow: p.isChallenge ? 'Production challenge' : `${p.topic.name} interview question`,
    title: truncate(p.title, 120),
    chips: [DIFFICULTY_LABEL[p.difficulty], p.topic.name, `${p.estimatedMinutes} min`].filter(Boolean),
    cta: 'Try this question',
  });
}