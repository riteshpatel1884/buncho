import { OG_SIZE, OG_TYPE, renderOg } from '@/lib/og';

export const alt = 'Buncho: AI, ML and GenAI interview practice with AI feedback';
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  return renderOg({
    eyebrow: 'Interview practice',
    title: 'Practice AI engineering interviews out loud or in writing',
    subtitle: 'Answer first, then compare with an expert reference solution.',
    chips: ['AI', 'ML', 'GenAI', 'Voice + text'],
  });
}