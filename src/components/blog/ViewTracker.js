'use client';

import { useEffect } from 'react';

// Counts a view every time an article page opens, however the reader got there: a link inside the site,
// Google, a shared URL, a refresh, or the back button. No unique-view or session filtering.
// Not rendered for admin previews, so editing does not inflate numbers.

// When each slug was last reported in this tab. It only exists to ignore the second run of an effect that
// React makes in development, so two calls for the same article within 2 seconds count once.
const lastSent = new Map();
const DUPLICATE_WINDOW_MS = 2000;

export default function ViewTracker({ slug }) {
  useEffect(() => {
    if (navigator.webdriver) return undefined;

    const send = () => {
      const now = Date.now();
      if (now - (lastSent.get(slug) ?? 0) < DUPLICATE_WINDOW_MS) return;
      lastSent.set(slug, now);

      fetch('/api/blog/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
        cache: 'no-store',
        keepalive: true,
      })
        .then((res) => (res.ok && res.status !== 204 ? res.json() : null))
        .then((data) => {
          // Tell the "Views" number on the page the new total, so it includes this visit
          if (data && typeof data.views === 'number') {
            window.dispatchEvent(new CustomEvent('buncho:views', { detail: { slug, views: data.views } }));
          }
        })
        .catch(() => {});
    };

    send();

    // Coming back to an article with the browser's back/forward buttons can restore the page without
    // running effects again. That is another open, so count it too.
    const onPageShow = (e) => {
      if (e.persisted) send();
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, [slug]);

  return null;
}