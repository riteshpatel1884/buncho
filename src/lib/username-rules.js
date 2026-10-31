// Pure username rules with no server imports, so client components can use them too.

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
export const USERNAME_COOLDOWN_DAYS = 30;

// Names that would clash with a route, or that could be used to impersonate the product
const RESERVED = new Set([
  'admin', 'administrator', 'api', 'app', 'about', 'advertise', 'billing', 'blog', 'buncho', 'challenges', 'community',
  'contact', 'dashboard', 'docs', 'help', 'home', 'jobs', 'login', 'logout', 'me', 'mod', 'moderator', 'new', 'null',
  'onboarding', 'pricing', 'privacy', 'problems', 'profile', 'register', 'report', 'root', 'settings', 'signin', 'signup',
  'staff', 'status', 'support', 'team', 'terms', 'topics', 'undefined', 'user', 'users', 'www',
]);

/** Lowercases, trims and drops a leading @. Usernames are always stored in this form. */
export const normalizeUsername = (raw) => String(raw ?? '').trim().replace(/^@/, '').toLowerCase();

/** Pure format check, safe to run on the client and the server. Does not look at the database. */
export function validateUsername(raw) {
  const username = normalizeUsername(raw);
  if (!username) return { ok: false, error: 'Pick a username.' };
  if (username.length < USERNAME_MIN) return { ok: false, error: `Use at least ${USERNAME_MIN} characters.` };
  if (username.length > USERNAME_MAX) return { ok: false, error: `Use at most ${USERNAME_MAX} characters.` };
  if (!/^[a-z0-9_-]+$/.test(username)) return { ok: false, error: 'Only letters, numbers, hyphens and underscores.' };
  if (!/^[a-z0-9]/.test(username) || !/[a-z0-9]$/.test(username)) return { ok: false, error: 'Start and end with a letter or number.' };
  if (/[_-]{2}/.test(username)) return { ok: false, error: 'No two hyphens or underscores in a row.' };
  if (/^\d+$/.test(username)) return { ok: false, error: 'Include at least one letter.' };
  if (RESERVED.has(username)) return { ok: false, error: 'That name is reserved. Try another one.' };
  return { ok: true, username };
}

export const profilePath = (username) => `/user/${username}`;

/** Days left before the username can be changed again (0 = free to change). */
export function cooldownDaysLeft(changedAt, now = Date.now()) {
  if (!changedAt) return 0;
  const end = new Date(changedAt).getTime() + USERNAME_COOLDOWN_DAYS * 86400000;
  return Math.max(0, Math.ceil((end - now) / 86400000));
}