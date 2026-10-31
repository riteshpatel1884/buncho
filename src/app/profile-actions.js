'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import {
  cooldownDaysLeft,
  profilePath,
  suggestUsernames,
  USERNAME_COOLDOWN_DAYS,
  validateUsername,
} from '@/lib/username';

const fail = (error, field) => ({ ok: false, error, field });
const SIGN_IN = 'You need to sign in first.';

/* ---------- input cleaning ---------- */

// Strips control characters and trims. Output is always rendered as plain text by React, never as HTML.
const text = (v, max) =>
  String(v ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);

/** Accepts "@name", "name" or a pasted profile URL, and keeps just the handle. */
function handle(v, pattern) {
  let s = text(v, 200).replace(/^@/, '');
  if (!s) return { value: null };
  if (/^https?:\/\//i.test(s) || s.includes('/')) {
    const parts = s.replace(/^https?:\/\//i, '').split(/[?#]/)[0].split('/').filter(Boolean);
    // linkedin.com/in/<handle>: the handle is the segment after "in"
    const i = parts.indexOf('in');
    s = i >= 0 && parts[i + 1] ? parts[i + 1] : parts[parts.length - 1] ?? '';
  }
  s = s.replace(/^@/, '');
  return pattern.test(s) ? { value: s } : { error: true };
}

const GITHUB = /^[A-Za-z\d](?:[A-Za-z\d]|-(?=[A-Za-z\d])){0,38}$/;
const LINKEDIN = /^[A-Za-z0-9-_%]{3,100}$/;
const X = /^[A-Za-z0-9_]{1,15}$/;

function cleanWebsite(v) {
  const raw = text(v, 200);
  if (!raw) return { value: null };
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.')) return { error: true };
    return { value: url.toString().replace(/\/$/, '') };
  } catch {
    return { error: true };
  }
}

/* ---------- username availability (live check in the settings form) ---------- */

export async function checkUsername(raw) {
  const user = await getOrCreateUser();
  if (!user) return fail(SIGN_IN);

  const v = validateUsername(raw);
  if (!v.ok) return { ok: true, state: 'invalid', message: v.error };
  if (v.username === user.username) return { ok: true, state: 'same', message: 'This is your current username.' };

  const taken = await prisma.user.findUnique({ where: { username: v.username }, select: { id: true } });
  if (!taken) return { ok: true, state: 'available', message: `${v.username} is available.` };

  const suggestions = await suggestUsernames({ name: user.name, email: user.email, seed: v.username });
  return { ok: true, state: 'taken', message: `${v.username} is already taken.`, suggestions };
}

/** Free names to show before the user has typed anything. */
export async function getUsernameSuggestions() {
  const user = await getOrCreateUser();
  if (!user) return [];
  return suggestUsernames({ name: user.name, email: user.email, limit: 4 });
}

/* ---------- save ---------- */

export async function saveProfileSettings(input = {}) {
  const user = await getOrCreateUser();
  if (!user) return fail(SIGN_IN);

  // Username: required, and limited to one change per cooldown period after the first one
  const v = validateUsername(input.username);
  if (!v.ok) return fail(v.error, 'username');
  const changing = v.username !== user.username;
  if (changing && user.username) {
    const left = cooldownDaysLeft(user.usernameChangedAt);
    if (left > 0) return fail(`You can change your username again in ${left} day${left === 1 ? '' : 's'}.`, 'username');
  }

  const github = handle(input.githubHandle, GITHUB);
  const linkedin = handle(input.linkedinHandle, LINKEDIN);
  const x = handle(input.xHandle, X);
  const website = cleanWebsite(input.website);
  if (github.error) return fail('That does not look like a GitHub username.', 'githubHandle');
  if (linkedin.error) return fail('That does not look like a LinkedIn handle (the part after /in/).', 'linkedinHandle');
  if (x.error) return fail('That does not look like an X handle.', 'xHandle');
  if (website.error) return fail('Enter a full website address, like https://example.com.', 'website');

  const data = {
    profileName: text(input.profileName, 40) || null,
    headline: text(input.headline, 80) || null,
    bio: text(input.bio, 280) || null,
    location: text(input.location, 60) || null,
    website: website.value,
    githubHandle: github.value,
    linkedinHandle: linkedin.value,
    xHandle: x.value,
    profilePublic: Boolean(input.profilePublic),
    showStats: Boolean(input.showStats),
    showAnswers: Boolean(input.showAnswers),
  };
  if (changing) {
    data.username = v.username;
    data.usernameChangedAt = new Date();
  }

  try {
    await prisma.user.update({ where: { id: user.id }, data });
  } catch (err) {
    // Two people claimed the same name at the same moment: the unique index decides who gets it
    if (err?.code === 'P2002') return fail('Someone just took that username. Try another one.', 'username');
    console.error('[profile] save failed', err);
    return fail('Could not save your profile. Please try again.');
  }

  if (user.username) revalidatePath(profilePath(user.username));
  revalidatePath(profilePath(v.username));
  revalidatePath('/dashboard');
  return { ok: true, username: v.username, path: profilePath(v.username), cooldownDays: USERNAME_COOLDOWN_DAYS };
}