'use client';

import { useEffect } from 'react';

// Counts one view per browser session. Not rendered for previews, so admins editing do not inflate numbers.
export default function ViewTracker({ slug }) {
  useEffect(() => {
    if (navigator.webdriver) return;
    const key = `blog-view:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      /* storage blocked: count anyway */
    }
    const timer = setTimeout(() => {
      fetch('/api/blog/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
        keepalive: true,
      }).catch(() => {});
    }, 4000); // a few seconds on the page filters out instant bounces and prefetch noise
    return () => clearTimeout(timer);
  }, [slug]);
  return null;
}
