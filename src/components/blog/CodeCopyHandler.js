'use client';

import { useEffect } from 'react';

/**
 * One click listener for every copy button on the page. Replaces a client component per code block, so articles
 * with many snippets hydrate less JavaScript and no longer send each snippet twice (HTML and component props).
 */
export default function CodeCopyHandler() {
  useEffect(() => {
    const onClick = async (e) => {
      const btn = e.target instanceof Element ? e.target.closest('button[data-copy]') : null;
      if (!btn) return;
      const code = btn.closest('.code-block')?.querySelector('pre code')?.textContent ?? '';
      const label = btn.textContent;
      try {
        await navigator.clipboard.writeText(code.replace(/\n$/, ''));
        btn.textContent = 'Copied';
      } catch {
        btn.textContent = 'Copy failed';
      }
      setTimeout(() => { btn.textContent = label === 'Copied' || label === 'Copy failed' ? 'Copy' : label; }, 1800);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}