'use client';

import { useState } from 'react';

export default function CopyCodeButton({ code }) {
  const [state, setState] = useState('idle');

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setState('copied');
    } catch {
      setState('error');
    }
    setTimeout(() => setState('idle'), 1800);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded px-2 py-0.5 text-xs font-medium text-muted hover:bg-line hover:text-ink"
      aria-label="Copy code to clipboard"
    >
      <span aria-live="polite">{state === 'copied' ? 'Copied' : state === 'error' ? 'Copy failed' : 'Copy'}</span>
    </button>
  );
}
