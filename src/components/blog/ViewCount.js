'use client';

import { useEffect, useState } from 'react';

// Shows the article's view count and updates it once the visit has been counted (see ViewTracker).
export default function ViewCount({ slug, initial }) {
  const [views, setViews] = useState(initial);

  useEffect(() => {
    setViews(initial);
  }, [initial]);

  useEffect(() => {
    const onViews = (e) => {
      if (e.detail?.slug === slug && typeof e.detail.views === 'number') {
        setViews((current) => Math.max(current, e.detail.views));
      }
    };
    window.addEventListener('buncho:views', onViews);
    return () => window.removeEventListener('buncho:views', onViews);
  }, [slug]);

  return <>{views.toLocaleString('en-IN')}</>;
}