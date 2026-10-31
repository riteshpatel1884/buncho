'use client';

import { useMemo, useState } from 'react';

const DAY = 86400000;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// bucket = days per bar (7 = one bar per week)
const RANGES = [
  { id: '6m', label: '6 Months', long: 'last 6 months', days: 182, bucket: 7 },
  { id: '3m', label: '3 Months', long: 'last 3 months', days: 91, bucket: 7 },
  { id: '30d', label: '30 Days', long: 'last 30 days', days: 30, bucket: 1 },
  { id: '7d', label: '7 Days', long: 'last 7 days', days: 7, bucket: 1 },
];

const parse = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};
const keyOf = (ms) => new Date(ms).toISOString().slice(0, 10);
const fmt = (ms) => {
  const d = new Date(ms);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
};

function buildSeries(activeDays, todayKey, range) {
  const end = parse(todayKey);
  const n = Math.ceil(range.days / range.bucket);
  const dateAt = (j) => end - (range.days - 1 - j) * DAY; // j = 0 is the oldest day shown
  return Array.from({ length: n }, (_, i) => {
    const from = i * range.bucket;
    const to = Math.min(range.days - 1, from + range.bucket - 1);
    let value = 0;
    for (let j = from; j <= to; j += 1) value += activeDays[keyOf(dateAt(j))] ?? 0;
    const start = dateAt(from);
    const last = dateAt(to);
    return { value, label: fmt(start), full: from === to ? fmt(start) : `${fmt(start)} – ${fmt(last)}` };
  });
}

const W = 640;
const H = 250;
const PAD = { l: 34, r: 10, t: 12, b: 30 };

export default function ActivityChart({ activeDays, todayKey }) {
  const [rangeId, setRangeId] = useState('7d');
  const [hover, setHover] = useState(null);
  const range = RANGES.find((r) => r.id === rangeId);

  const series = useMemo(() => buildSeries(activeDays, todayKey, range), [activeDays, todayKey, range]);
  const total = series.reduce((a, s) => a + s.value, 0);
  const max = Math.max(0, ...series.map((s) => s.value));
  const yMax = max <= 4 ? 4 : Math.ceil(max / 4) * 4;

  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const slot = innerW / series.length;
  const barW = Math.min(slot * 0.6, 34);
  const labelStep = Math.ceil(series.length / 7);
  const y = (v) => PAD.t + innerH - (v / yMax) * innerH;
  const active = hover !== null ? series[hover] : null;

  return (
    <section aria-label="Activity" className="card p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight">Activity</h2>
          <p className="mt-1 text-sm text-muted">Total of {range.long}</p>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-semibold tabular-nums tracking-tight text-accent">{active ? active.value : total}</span>
            <span className="text-sm text-muted">
              {active ? `${active.value === 1 ? 'problem' : 'problems'} · ${active.full}` : total === 1 ? 'problem solved' : 'problems solved'}
            </span>
          </p>
        </div>

        <div role="tablist" aria-label="Time range" className="flex shrink-0 self-start rounded-xl border border-line bg-surface-2/60 p-1">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={r.id === rangeId}
              onClick={() => {
                setRangeId(r.id);
                setHover(null);
              }}
              className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors sm:px-3 sm:text-sm ${
                r.id === rangeId ? 'bg-bg text-ink shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-5">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label={`${total} problems solved in the ${range.long}`}
          onMouseLeave={() => setHover(null)}
        >
          {/* grid + y labels */}
          {[0, 1, 2, 3, 4].map((t) => {
            const v = (yMax / 4) * t;
            return (
              <g key={t}>
                <line
                  x1={PAD.l}
                  x2={W - PAD.r}
                  y1={y(v)}
                  y2={y(v)}
                  stroke="var(--line)"
                  strokeWidth={t === 0 ? 1.5 : 1}
                  strokeDasharray={t === 0 ? undefined : '3 5'}
                />
                <text x={PAD.l - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">
                  {v}
                </text>
              </g>
            );
          })}

          {/* bars */}
          {series.map((s, i) => {
            const cx = PAD.l + slot * i + slot / 2;
            const h = (s.value / yMax) * innerH;
            return (
              <g key={i}>
                {s.value > 0 && (
                  <rect
                    x={cx - barW / 2}
                    y={y(s.value)}
                    width={barW}
                    height={h}
                    rx={Math.min(6, barW / 2)}
                    fill="var(--accent)"
                    opacity={hover === null || hover === i ? 1 : 0.45}
                  />
                )}
                {i % labelStep === 0 && (
                  <text x={cx} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--muted)">
                    {s.label}
                  </text>
                )}
                {/* full-height hit area for hover / touch */}
                <rect
                  x={PAD.l + slot * i}
                  y={PAD.t}
                  width={slot}
                  height={innerH}
                  fill="transparent"
                  onMouseEnter={() => setHover(i)}
                  onTouchStart={() => setHover(i)}
                >
                  <title>{`${s.full}: ${s.value} ${s.value === 1 ? 'problem' : 'problems'}`}</title>
                </rect>
              </g>
            );
          })}
        </svg>

        {total === 0 && (
          <p className="pointer-events-none absolute inset-0 grid place-items-center pb-8 text-sm text-muted">
            No activity in this period yet. Solve a problem to start your graph.
          </p>
        )}
      </div>
    </section>
  );
}