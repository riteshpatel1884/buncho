'use client';

import { useState } from 'react';

// Tab bar + panes for the left side of the problem workspace.
// Every pane is rendered on the server and passed in, so switching tabs never refetches anything.
export default function ProblemTabs({ tabs, initial }) {
  const [active, setActive] = useState(initial ?? tabs[0].id);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div role="tablist" aria-label="Problem sections" className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-line bg-surface-2 px-2">
        {tabs.map((t) => {
          const on = t.id === active;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={on}
              aria-controls={`pane-${t.id}`}
              onClick={() => setActive(t.id)}
              className={`flex h-10 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors ${
                on ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              <span className={on ? 'text-accent' : ''}>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`pane-${t.id}`}
          aria-labelledby={`tab-${t.id}`}
          hidden={t.id !== active}
          className="min-h-0 flex-1 overflow-y-auto px-5 py-5"
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}