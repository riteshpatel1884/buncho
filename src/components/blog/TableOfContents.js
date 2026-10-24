'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from '@/components/icons';

// items: [{ id, text, level: 2 | 3 }]. Highlights the section currently being read.
export default function TableOfContents({ items }) {
  const [active, setActive] = useState(items[0]?.id ?? null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!items.length) return undefined;
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean);
    if (!els.length) return undefined;
    // A heading is "current" once it passes the top band of the viewport
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-72px 0px -70% 0px', threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  if (!items.length) return null;

  return (
    <nav aria-label="Table of contents" className="rounded-lg border border-line bg-surface lg:border-0 lg:bg-transparent">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="toc-list"
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold lg:hidden"
      >
        Contents
        <ChevronDown width={16} height={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <p className="mb-3 hidden text-xs font-semibold uppercase tracking-wider text-muted lg:block">Contents</p>
      <ol id="toc-list" className={`${open ? 'block' : 'hidden'} space-y-0.5 border-t border-line px-2 py-2 text-sm lg:block lg:border-0 lg:border-l lg:px-0 lg:py-0`}>
        {items.map((item) => {
          const on = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={on ? 'location' : undefined}
                onClick={() => setOpen(false)}
                className={`-ml-px block border-l-2 py-1.5 leading-snug transition-colors ${item.level === 3 ? 'pl-7 pr-2' : 'pl-4 pr-2'} ${
                  on ? 'border-accent font-semibold text-ink' : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
