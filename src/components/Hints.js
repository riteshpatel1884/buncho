'use client';

import { useState } from 'react';

export default function Hints({ hints }) {
  const [shown, setShown] = useState(0);
  if (!hints?.length) return null;

  return (
    <section aria-labelledby="hints-heading">
      <h2 id="hints-heading" className="text-base font-semibold">
        Hints
      </h2>
      {shown > 0 && (
        <ol className="mt-3 space-y-2">
          {hints.slice(0, shown).map((hint, i) => (
            <li key={i} className="rounded-md border border-line bg-surface-2 px-4 py-3 text-sm">
              <span className="font-semibold">Hint {i + 1}.</span> {hint}
            </li>
          ))}
        </ol>
      )}
      {shown < hints.length && (
        <button
          type="button"
          onClick={() => setShown((n) => n + 1)}
          className="mt-3 rounded-md bg-surface-2 px-3.5 py-1.5 text-sm font-medium hover:bg-line"
        >
          {shown === 0 ? 'Show a hint' : `Show hint ${shown + 1} of ${hints.length}`}
        </button>
      )}
    </section>
  );
}