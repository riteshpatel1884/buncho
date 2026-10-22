import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from '@/lib/seo';

export default function manifest() {
  return {
    name: `${SITE_NAME}: ${SITE_TAGLINE}`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#1a1a1a',
    theme_color: '#34d67b',
    categories: ['education'],
    icons: [{ src: '/icon.png', sizes: '67x66', type: 'image/png' }],
  };
}