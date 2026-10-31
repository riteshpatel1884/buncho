import { findProfileUser, getProfileData } from '@/lib/profile';
import { profileTheme } from '@/lib/profile-theme';

// A small SVG badge people can paste into a GitHub README:
//   [![Buncho profile](https://buncho.live/user/<name>/badge)](https://buncho.live/user/<name>)
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);

// Rough text width for 11px Verdana-like fonts, enough to size the two halves
const width = (s) => Math.round(String(s).length * 6.6 + 18);

export async function GET(_req, { params }) {
  const { username } = await params;
  let left = 'buncho';
  let right = 'profile';
  let color = '#158f47';

  try {
    const user = await findProfileUser(username);
    if (user?.profilePublic) {
      color = profileTheme(user.username).b;
      right = `@${user.username}`;
      if (user.showStats) {
        const data = await getProfileData(user);
        right = `${data.stats.solved} solved · ${data.level.name}`;
      }
    }
  } catch {
    // keep the generic badge
  }

  const lw = width(left);
  const rw = width(right);
  const w = lw + rw;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="22" role="img" aria-label="${esc(`${left}: ${right}`)}">
<title>${esc(`${left}: ${right}`)}</title>
<linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-opacity=".12"/></linearGradient>
<clipPath id="r"><rect width="${w}" height="22" rx="4"/></clipPath>
<g clip-path="url(#r)"><rect width="${lw}" height="22" fill="#1a1a1a"/><rect x="${lw}" width="${rw}" height="22" fill="${color}"/><rect width="${w}" height="22" fill="url(#s)"/></g>
<g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
<text x="${lw / 2}" y="15">${esc(left)}</text><text x="${lw + rw / 2}" y="15" font-weight="bold">${esc(right)}</text></g></svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}