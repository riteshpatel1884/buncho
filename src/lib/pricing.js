import { cache } from 'react';
import { prisma } from './prisma';
import { PRO_PERIOD_MONTHS, PRO_PRICE_INR } from './constants';

export const OFFER_TYPES = {
  PERCENT_OFF: 'Percent off',
  FLAT_OFF: 'Flat ₹ off',
  EXTRA_DAYS: 'Bonus days free',
};

export const monthsLabel = (n) => (n === 1 ? '1 month' : `${n} months`);
export const normalizeCode = (s) => String(s ?? '').toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 24);

/** Adds calendar months (Jan 31 + 1 month = Feb 28, not Mar 3). */
export function addMonths(date, n) {
  const d = new Date(date.getTime());
  const day = d.getDate();
  d.setMonth(d.getMonth() + n);
  if (d.getDate() < day) d.setDate(0);
  return d;
}

const DEFAULTS = {
  proName: 'Buncho Pro',
  priceInr: PRO_PRICE_INR,
  periodMonths: PRO_PERIOD_MONTHS,
  checkoutOpen: true,
  offerOn: false,
  offerLabel: '',
  offerType: 'PERCENT_OFF',
  offerValue: 0,
  offerEndsAt: null,
};

/** The editable pricing. Falls back to the defaults if the table is empty or not created yet. */
export const getBillingSettings = cache(async () => {
  try {
    const row = await prisma.billingSettings.findUnique({ where: { id: 'default' } });
    if (!row) return { ...DEFAULTS };
    return {
      proName: row.proName || DEFAULTS.proName,
      priceInr: row.priceInr,
      periodMonths: row.periodMonths,
      checkoutOpen: row.checkoutOpen,
      offerOn: row.offerOn,
      offerLabel: row.offerLabel ?? '',
      offerType: row.offerType,
      offerValue: row.offerValue,
      offerEndsAt: row.offerEndsAt,
    };
  } catch (err) {
    console.error('[pricing] could not read billing settings, using defaults', err);
    return { ...DEFAULTS };
  }
});

export function describeDeal(type, value) {
  if (type === 'PERCENT_OFF') return `${value}% off`;
  if (type === 'FLAT_OFF') return `₹${value} off`;
  if (type === 'EXTRA_DAYS') return `${value} bonus days free`;
  return '';
}

const siteOfferActive = (s) => s.offerOn && s.offerValue > 0 && (!s.offerEndsAt || s.offerEndsAt > new Date());

function dealFor(type, value, listRupees) {
  if (type === 'PERCENT_OFF') return { discountRupees: Math.round((listRupees * Math.min(value, 99)) / 100), bonusDays: 0 };
  if (type === 'FLAT_OFF') return { discountRupees: Math.min(value, listRupees - 1), bonusDays: 0 };
  if (type === 'EXTRA_DAYS') return { discountRupees: 0, bonusDays: value };
  return { discountRupees: 0, bonusDays: 0 };
}

/** Checks a promo code for this user. Returns { ok: true, row } or { ok: false, error }. */
export async function findUsableCode(raw, userId) {
  const code = normalizeCode(raw);
  if (!code) return { ok: false, error: 'Enter a promo code.' };
  const row = await prisma.discountCode.findUnique({ where: { code } });
  const now = new Date();
  if (!row || !row.active) return { ok: false, error: 'That code is not valid.' };
  if (row.startsAt && row.startsAt > now) return { ok: false, error: 'That code is not active yet.' };
  if (row.expiresAt && row.expiresAt < now) return { ok: false, error: 'That code has expired.' };
  if (row.maxRedemptions != null && row.redeemedCount >= row.maxRedemptions) return { ok: false, error: 'That code has been fully used.' };
  if (userId) {
    const used = await prisma.payment.count({ where: { userId, discountCode: code, status: 'PAID' } });
    if (used >= row.perUserLimit) return { ok: false, error: 'You have already used that code.' };
  }
  return { ok: true, row };
}

/**
 * The price a visitor pays right now. A valid promo code replaces the site-wide offer (they do not stack).
 * Whole rupees only, and never below ₹1 because the payment provider cannot charge less.
 * If a code was given but is invalid, `error` is set and the normal (offer or list) price is returned.
 */
export async function getQuote({ userId = null, code = '' } = {}) {
  const settings = await getBillingSettings();
  const listRupees = settings.priceInr;

  let deal = null;
  let source = null;
  let usedCode = null;
  let error = null;

  if (String(code ?? '').trim()) {
    const found = await findUsableCode(code, userId);
    if (found.ok) {
      deal = { type: found.row.type, value: found.row.value };
      source = 'code';
      usedCode = found.row.code;
    } else {
      error = found.error;
    }
  }
  if (!deal && siteOfferActive(settings)) {
    deal = { type: settings.offerType, value: settings.offerValue };
    source = 'offer';
  }

  const { discountRupees, bonusDays } = deal ? dealFor(deal.type, deal.value, listRupees) : { discountRupees: 0, bonusDays: 0 };
  const finalRupees = Math.max(1, listRupees - discountRupees);

  return {
    settings,
    months: settings.periodMonths,
    listPaise: listRupees * 100,
    finalPaise: finalRupees * 100,
    discountPaise: (listRupees - finalRupees) * 100,
    bonusDays,
    dealLabel: deal ? describeDeal(deal.type, deal.value) : '',
    source,
    code: usedCode,
    error,
  };
}

/** Price in rupees to show on upgrade buttons around the app (includes any live site-wide offer). */
export async function getProPriceInr() {
  const q = await getQuote();
  return Math.round(q.finalPaise / 100);
}