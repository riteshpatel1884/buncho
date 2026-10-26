import { prisma } from './prisma';

/**
 * Sponsor banners shown in the "Sponsored" section on /problems.
 * Prices come from env (AD_SLOT_1_PRICE_USD, AD_SLOT_2_PRICE_USD). The defaults below are used when they are not set.
 */
export const AD_PERIOD_MONTHS = 1;

export const AD_SLOTS = {
  SLOT_1: { n: 1, label: 'Column 1', envKey: 'AD_SLOT_1_PRICE_USD', fallbackUsd: 3 },
  SLOT_2: { n: 2, label: 'Column 2', envKey: 'AD_SLOT_2_PRICE_USD', fallbackUsd: 2 },
};
export const SLOT_KEYS = Object.keys(AD_SLOTS);

/** "1" | "2" | "SLOT_1" | "SLOT_2" -> "SLOT_1" | "SLOT_2" | null */
export function slotFromParam(value) {
  const v = String(value ?? '').toUpperCase().replace('SLOT_', '');
  if (v === '1') return 'SLOT_1';
  if (v === '2') return 'SLOT_2';
  return null;
}

/** Price of one month in US cents. Read on the server every time, so the browser can never change it. */
export function slotPriceCents(slot) {
  const cfg = AD_SLOTS[slot];
  const raw = Number(process.env[cfg.envKey]);
  const dollars = Number.isFinite(raw) && raw > 0 ? raw : cfg.fallbackUsd;
  return Math.round(dollars * 100);
}

export const usd = (cents) =>
  `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;

/**
 * Your real site numbers, shown to advertisers before they pay (source: Vercel Analytics, last 7 days).
 * Update these by hand whenever you want the page to show fresher numbers.
 */
export const AD_STATS = {
  site: 'www.buncho.live',
  periodLabel: 'Last 7 days',
  asOf: 'Oct 26, 2026',
  visitors: 627,
  visitorsGrowth: 371, // percent vs the previous 7 days
  pageViews: 2460,
  pageViewsGrowth: 349,
  bounceRate: 49,
  bounceChange: -11, // negative is good: fewer people leave straight away
  countries: [
    { name: 'India', flag: '🇮🇳', share: 74, visitors: 466, views: '1.8K' },
    { name: 'United States', flag: '🇺🇸', share: 11, visitors: 70, views: '412' },
    { name: 'United Kingdom', flag: '🇬🇧', share: 2, visitors: 11, views: '41' },
  ],
};

/* ---------- Validation helpers ---------- */

export const str = (value, max) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

/** Returns a clean https URL, or null when it is not valid. A missing "https://" is added. */
export function cleanUrl(value) {
  const s = String(value ?? '').trim();
  if (!s) return null;
  if (/^http:\/\//i.test(s)) return null;
  try {
    const u = new URL(/^https:\/\//i.test(s) ? s : `https://${s}`);
    if (u.protocol !== 'https:' || !u.hostname.includes('.') || u.username || u.password) return null;
    return u.toString();
  } catch {
    return null;
  }
}

export const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);

/* ---------- Queries ---------- */

const LIVE_FIELDS = {
  id: true,
  slot: true,
  companyName: true,
  tagline: true,
  description: true,
  linkUrl: true,
  logoUrl: true,
  ctaLabel: true,
  endsAt: true,
};

/** { SLOT_1?: ad, SLOT_2?: ad } for banners that are live right now. Never throws, so /problems always loads. */
export async function getLiveAds() {
  try {
    const now = new Date();
    const rows = await prisma.adBooking.findMany({
      where: { status: 'APPROVED', startsAt: { lte: now }, endsAt: { gt: now } },
      orderBy: { startsAt: 'desc' },
      select: LIVE_FIELDS,
    });
    const bySlot = {};
    for (const row of rows) if (!bySlot[row.slot]) bySlot[row.slot] = row;
    return bySlot;
  } catch (err) {
    console.error('[ads] could not load live banners', err);
    return {};
  }
}

/**
 * Whether each column can be bought right now.
 * { SLOT_1: { state: 'open' | 'live' | 'review', until?: Date }, SLOT_2: { ... } }
 * "live" = a banner is running (until its end date). "review" = someone paid and is waiting for approval.
 */
export async function getSlotAvailability() {
  const result = { SLOT_1: { state: 'open' }, SLOT_2: { state: 'open' } };
  try {
    const now = new Date();
    const rows = await prisma.adBooking.findMany({
      where: { OR: [{ status: 'PAID' }, { status: 'APPROVED', endsAt: { gt: now } }] },
      select: { slot: true, status: true, endsAt: true },
    });
    for (const row of rows) {
      if (row.status === 'APPROVED') result[row.slot] = { state: 'live', until: row.endsAt };
      else if (result[row.slot].state === 'open') result[row.slot] = { state: 'review' };
    }
  } catch (err) {
    console.error('[ads] could not check availability', err);
  }
  return result;
}