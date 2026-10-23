'use client';

import { useEffect, useState } from 'react';
import { Pause, Play } from './icons';

// Count-up timer for the problem page, like the one in LeetCode's top bar.
export default function Timer() {
  const [secs, setSecs] = useState(0);
  const [running, setRunning] = useState(false); // starts only when the user presses play

  useEffect(() => {
    if (!running) return undefined;
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const two = (n) => String(n).padStart(2, '0');
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  return (
    <div className="flex items-center gap-2 rounded-md bg-surface px-2.5 py-1 text-sm tabular-nums">
      <button
        type="button"
        onClick={() => setRunning((r) => !r)}
        aria-label={running ? 'Pause timer' : secs === 0 ? 'Start timer' : 'Resume timer'}
        title={running ? 'Pause timer' : secs === 0 ? 'Start timer' : 'Resume timer'}
        className="grid h-5 w-5 place-items-center text-muted hover:text-ink"
      >
        {running ? <Pause width={14} height={14} /> : <Play width={13} height={13} />}
      </button>
      <span className={running ? 'font-medium text-accent' : 'text-muted'}>
        {two(h)}:{two(m)}:{two(s)}
      </span>
    </div>
  );
}