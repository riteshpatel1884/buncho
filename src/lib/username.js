import { prisma } from './prisma';
import { normalizeUsername, USERNAME_MAX, validateUsername } from './username-rules';

export * from './username-rules';

/** Candidate usernames from a name or email, e.g. "Ritesh Kumar" gives ritesh, ritesh-kumar, riteshkumar. */
function baseCandidates(name, email) {
  const clean = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const parts = clean(name).split(' ').filter(Boolean);
  const local = clean(String(email ?? '').split('@')[0]).replace(/\s+/g, '');
  const out = [];
  if (parts[0]) out.push(parts[0]);
  if (parts.length > 1) out.push(parts.join('-'), parts.join(''), `${parts[0]}-${parts[parts.length - 1][0]}`);
  if (local) out.push(local);
  return out.filter((c) => validateUsername(c).ok);
}

/** Up to `limit` free usernames. Tries the bases first, then adds a short suffix. */
export async function suggestUsernames({ name, email, seed, limit = 3 }) {
  const bases = baseCandidates(name, email);
  if (seed && validateUsername(seed).ok) bases.unshift(normalizeUsername(seed));
  if (!bases.length) bases.push('learner');

  const pool = new Set(bases);
  const suffixes = ['ai', 'ml', 'dev', 'builds', 'codes'];
  bases.slice(0, 2).forEach((b) => {
    suffixes.forEach((s) => pool.add(`${b}-${s}`.slice(0, USERNAME_MAX)));
    for (let i = 0; i < 3; i += 1) pool.add(`${b}${Math.floor(10 + Math.random() * 990)}`.slice(0, USERNAME_MAX));
  });

  const candidates = [...pool].filter((c) => validateUsername(c).ok);
  const taken = await prisma.user.findMany({ where: { username: { in: candidates } }, select: { username: true } });
  const takenSet = new Set(taken.map((t) => t.username));
  return candidates.filter((c) => !takenSet.has(c) && c !== normalizeUsername(seed)).slice(0, limit);
}