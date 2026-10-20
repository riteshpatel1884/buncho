'use client';

import { useEffect, useRef, useState } from 'react';
import { Maximize, Minus, Restore } from './icons';

const KEY = 'buncho-split';
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

function Controls({ state, label, onMinimize, onMaximize, onRestore }) {
  const btn = 'grid h-7 w-7 place-items-center rounded-md text-muted transition-colors hover:bg-line hover:text-ink';
  return (
    <div className="absolute right-2 top-1.5 z-10 flex items-center gap-0.5">
      {state === 'split' ? (
        <>
          <button type="button" onClick={onMinimize} className={btn} title={`Minimize ${label}`} aria-label={`Minimize ${label}`}>
            <Minus width={15} height={15} />
          </button>
          <button type="button" onClick={onMaximize} className={btn} title={`Maximize ${label}`} aria-label={`Maximize ${label}`}>
            <Maximize width={14} height={14} />
          </button>
        </>
      ) : (
        <button type="button" onClick={onRestore} className={btn} title={`Restore ${label}`} aria-label={`Restore ${label}`}>
          <Restore width={14} height={14} />
        </button>
      )}
    </div>
  );
}

function Pane({ label, state, className, style, onRestore, controls, children }) {
  const min = state === 'min';
  return (
    <section aria-label={label} style={style} className={`panel relative flex min-w-0 flex-col overflow-hidden lg:min-h-0 ${className}`}>
      {min && (
        <button
          type="button"
          onClick={onRestore}
          title={`Restore ${label}`}
          aria-label={`Restore ${label}`}
          className="flex h-10 w-full items-center gap-2 px-3 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-ink lg:h-full lg:flex-col lg:items-center lg:px-0 lg:py-3"
        >
          <Restore width={15} height={15} />
          <span className="lg:[writing-mode:vertical-rl]">{label}</span>
        </button>
      )}
      {/* Kept mounted while minimized so the answer you are typing is never lost */}
      <div className={min ? 'hidden' : 'flex min-h-0 flex-1 flex-col'}>{children}</div>
      {!min && controls}
    </section>
  );
}

/**
 * Two resizable panes. Each one can be minimized (collapsed to a thin strip),
 * maximized (takes the whole workspace) or restored. On desktop the divider can be dragged.
 */
export default function Workspace({ left, right, leftLabel = 'Problem', rightLabel = 'Answer' }) {
  const [layout, setLayout] = useState('split'); // 'split' | 'left' (left maximized) | 'right' (right maximized)
  const [ratio, setRatio] = useState(50);
  const [dragging, setDragging] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    try {
      const saved = parseFloat(localStorage.getItem(KEY));
      if (Number.isFinite(saved)) setRatio(clamp(saved, 20, 80));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, String(ratio));
    } catch {}
  }, [ratio]);

  const leftState = layout === 'split' ? 'split' : layout === 'left' ? 'max' : 'min';
  const rightState = layout === 'split' ? 'split' : layout === 'right' ? 'max' : 'min';

  const leftCls =
    leftState === 'min'
      ? 'lg:flex-none lg:basis-11'
      : leftState === 'max'
        ? 'min-h-[70dvh] lg:flex-1'
        : 'min-h-[70dvh] lg:[flex:0_0_var(--w)]';
  const rightCls =
    rightState === 'min' ? 'lg:flex-none lg:basis-11' : 'min-h-[32rem] lg:flex-1';

  function onPointerDown(e) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  }
  function onPointerMove(e) {
    if (!dragging || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setRatio(clamp(((e.clientX - r.left) / r.width) * 100, 20, 80));
  }
  function onKeyDown(e) {
    if (e.key === 'ArrowLeft') setRatio((n) => clamp(n - 5, 20, 80));
    else if (e.key === 'ArrowRight') setRatio((n) => clamp(n + 5, 20, 80));
    else if (e.key === 'Home') setRatio(50);
  }

  return (
    <div ref={ref} className={`flex min-h-0 flex-1 flex-col lg:flex-row ${dragging ? 'select-none' : ''}`}>
      <Pane
        label={leftLabel}
        state={leftState}
        className={leftCls}
        style={{ '--w': `${ratio}%` }}
        onRestore={() => setLayout('split')}
        controls={
          <Controls
            state={leftState}
            label={leftLabel}
            onMinimize={() => setLayout('right')}
            onMaximize={() => setLayout('left')}
            onRestore={() => setLayout('split')}
          />
        }
      >
        {left}
      </Pane>

      {/* Divider: a spacer on mobile / when a pane is collapsed, a drag handle when split on desktop */}
      <div className="h-2 shrink-0 lg:h-auto lg:w-2">
        {layout === 'split' && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize panels. Use the left and right arrow keys, or double-click to reset."
            tabIndex={0}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={() => setDragging(false)}
            onPointerCancel={() => setDragging(false)}
            onDoubleClick={() => setRatio(50)}
            onKeyDown={onKeyDown}
            className="group hidden h-full w-full cursor-col-resize items-center justify-center lg:flex"
          >
            <span className={`h-10 w-1 rounded-full transition-colors ${dragging ? 'bg-accent' : 'bg-line group-hover:bg-accent'}`} />
          </div>
        )}
      </div>

      <Pane
        label={rightLabel}
        state={rightState}
        className={rightCls}
        onRestore={() => setLayout('split')}
        controls={
          <Controls
            state={rightState}
            label={rightLabel}
            onMinimize={() => setLayout('left')}
            onMaximize={() => setLayout('right')}
            onRestore={() => setLayout('split')}
          />
        }
      >
        {right}
      </Pane>
    </div>
  );
}