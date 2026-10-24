import { SITE_URL } from '@/lib/seo';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard',
          '/admin',
          '/jobs',
          '/billing',
          // Internal search results and login redirects are endless URL variations with no search value
          '/*?q=',
          '/*&q=',
          '/*?tag=',
          '/*&tag=',
          '/*?redirect_url=',
          '/*&redirect_url=',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}