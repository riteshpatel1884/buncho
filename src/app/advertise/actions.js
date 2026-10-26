'use server';

import crypto from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { AD_PERIOD_MONTHS, cleanUrl, getSlotAvailability, isEmail, slotFromParam, slotPriceCents, str } from '@/lib/ads';
import { appUrl, createDodoCheckout } from '@/lib/dodo';

const MAX_PENDING_PER_HOUR = 5;

/** Saves the banner details, then starts a Dodo checkout. Returns { ok, url } or { ok: false, error }. */
export async function startAdCheckout(input) {
  // Never let an error escape: an uncaught throw in a server action replaces the whole page with an error screen.
  try {
    const user = await getOrCreateUser();
    if (!user) return { ok: false, error: 'Log in to book a banner.', code: 'AUTH' };

    const slot = slotFromParam(input?.slot);
    if (!slot) return { ok: false, error: 'Choose a column first.' };

    const companyName = str(input?.companyName, 60);
    const tagline = str(input?.tagline, 110);
    const description = str(input?.description, 200);
    const ctaLabel = str(input?.ctaLabel, 24) || 'Learn more';
    const contactEmail = str(input?.contactEmail, 120);
    const linkUrl = cleanUrl(input?.linkUrl);
    const logoRaw = String(input?.logoUrl ?? '').trim();
    const logoUrl = logoRaw ? cleanUrl(logoRaw) : '';

    if (companyName.length < 2) return { ok: false, error: 'Enter your product or company name.' };
    if (tagline.length < 10) return { ok: false, error: 'Write a short tagline (at least 10 characters).' };
    if (!linkUrl) return { ok: false, error: 'Enter a valid link that starts with https://' };
    if (logoRaw && !logoUrl) return { ok: false, error: 'The logo link must be a valid https:// image URL, or leave it empty.' };
    if (!isEmail(contactEmail)) return { ok: false, error: 'Enter a valid contact email.' };

    const availability = (await getSlotAvailability())[slot];
    if (availability.state === 'live') return { ok: false, error: 'This column is booked right now. Try the other column or come back later.' };
    if (availability.state === 'review') return { ok: false, error: 'Someone has just booked this column and it is being reviewed. Try the other column.' };

    const recent = await prisma.adBooking.count({
      where: { userId: user.id, status: 'PENDING_PAYMENT', createdAt: { gte: new Date(Date.now() - 3600 * 1000) } },
    });
    if (recent >= MAX_PENDING_PER_HOUR) return { ok: false, error: 'Too many payment attempts. Please try again in a while.' };

    const orderId = `ad_${crypto.randomUUID().replace(/-/g, '')}`;
    const amountCents = slotPriceCents(slot);

    await prisma.adBooking.create({
      data: {
        orderId,
        userId: user.id,
        slot,
        companyName,
        tagline,
        description: description || null,
        linkUrl,
        logoUrl: logoUrl || null,
        ctaLabel,
        contactEmail,
        amountCents,
        currency: 'USD',
        periodMonths: AD_PERIOD_MONTHS,
      },
    });

    try {
      const session = await createDodoCheckout({
        orderId,
        amountCents,
        email: contactEmail,
        name: user.name,
        returnUrl: `${appUrl()}/advertise/return?order=${orderId}`,
        metadata: { slot, user_id: user.id },
      });
      await prisma.adBooking.update({ where: { orderId }, data: { dodoSessionId: session.session_id ?? null } });
      return { ok: true, url: session.checkout_url };
    } catch (err) {
      console.error('[ads] could not create checkout', err);
      await prisma.adBooking.update({ where: { orderId }, data: { status: 'FAILED' } }).catch(() => {});
      return { ok: false, error: 'We could not start the payment. Please try again.' };
    }
  } catch (err) {
    console.error('[ads] startAdCheckout failed', err?.code, err);
    return { ok: false, error: 'Payments are temporarily unavailable. Please try again in a few minutes.' };
  }
}