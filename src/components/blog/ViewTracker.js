'use client';

import { useEffect, useRef } from 'react';

// Counts a view every time a blog article is opened or refreshed.
// No unique-view / session filtering: repeat visits by the same reader count too.
// Not rendered for previews, so admins editing do not inflate numbers.
export default function ViewTracker({ slug }) {
  const sent = useRef(null);

  useEffect(() => {
    if (navigator.webdriver) return;
    // Guards only against React dev-mode double effects, not against refreshes
    if (sent.current === slug) return;
    sent.current = slug;

    fetch('/api/blog/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
      keepalive: true,
    }).catch(() => {});
  }, [slug]);

  return null;
}