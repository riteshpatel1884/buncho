'use client';

import { useState } from 'react';

export default function Hints({ hints }) {
  const [shown, setShown] = useState(0);
  if (!hints?.length) return null;

  return (
    <section aria-labelledby="hints-heading">
      <h2 id="hints-heading" className="font-display text-xl font-semibold">
        Hints
      </h2>
      {shown > 0 && (
        <ol className="mt-3 space-y-2">
          {hints.slice(0, shown).map((hint, i) => (
            <li key={i} className="rounded-lg border-l-4 border-mark bg-surface px-4 py-3 text-[0.97rem]">
              <span className="font-semibold">Hint {i + 1}.</span> {hint}
            </li>
          ))}
        </ol>
      )}
      {shown < hints.length && (
        <button
          type="button"
          onClick={() => setShown((n) => n + 1)}
          className="mt-3 rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold hover:bg-surface-2"
        >
          {shown === 0 ? 'Show a hint' : `Show hint ${shown + 1} of ${hints.length}`}
        </button>
      )}
    </section>
  );
}
