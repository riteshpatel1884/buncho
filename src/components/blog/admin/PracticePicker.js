'use client';

import { useEffect, useRef, useState } from 'react';
import { getProblemFilters, searchProblems, getProblemsByIds } from '@/app/admin/blog/actions';
import { DIFFICULTIES, DIFFICULTY_LABEL, PROBLEM_TYPES } from '@/lib/constants';
import { inputCls } from './fields';

const MAX = 12;
const DIFF_STYLE = { EASY: 'bg-easy/12 text-easy', MEDIUM: 'bg-medium/12 text-medium', HARD: 'bg-hard/12 text-hard' };
const typeLabel = (t) => t.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

/**
 * Lets an admin attach practice questions from the problem bank to an article.
 * `value` is an ordered array of problem ids; the details shown here are loaded from the server.
 */
export default function PracticePicker({ value, onChange }) {
  const [options, setOptions] = useState({ topics: [], subcategories: {} });
  const [filters, setFilters] = useState({ q: '', topic: '', subcategory: '', difficulty: '', type: '' });
  const [results, setResults] = useState({ items: [], total: 0, loading: true, error: null });
  const [known, setKnown] = useState({}); // id -> problem details (selected ones and anything seen in results)
  const requestId = useRef(0);

  // Filter dropdown options, loaded once
  useEffect(() => {
    getProblemFilters()
      .then((res) => res.ok && setOptions({ topics: res.topics, subcategories: res.subcategories }))
      .catch(() => {});
  }, []);

  // Details of the questions already attached (when editing an existing article)
  useEffect(() => {
    const missing = value.filter((id) => !known[id]);
    if (!missing.length) return;
    getProblemsByIds(missing)
      .then((res) => res.ok && setKnown((k) => ({ ...k, ...Object.fromEntries(res.items.map((p) => [p.id, p])) })))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.join(',')]);

  // Search as the filters change (debounced so typing does not fire a request per key)
  useEffect(() => {
    const id = ++requestId.current;
    setResults((r) => ({ ...r, loading: true, error: null }));
    const t = setTimeout(() => {
      searchProblems(filters)
        .then((res) => {
          if (id !== requestId.current) return;
          if (!res.ok) return setResults({ items: [], total: 0, loading: false, error: res.error });
          setKnown((k) => ({ ...k, ...Object.fromEntries(res.items.map((p) => [p.id, p])) }));
          setResults({ items: res.items, total: res.total, loading: false, error: null });
        })
        .catch(() => id === requestId.current && setResults({ items: [], total: 0, loading: false, error: 'Could not load questions.' }));
    }, 300);
    return () => clearTimeout(t);
  }, [filters]);

  const setFilter = (patch) => setFilters((f) => ({ ...f, ...patch }));
  const add = (p) => value.length < MAX && !value.includes(p.id) && onChange([...value, p.id]);
  const remove = (id) => onChange(value.filter((x) => x !== id));
  const move = (i, dir) => {
    const next = [...value];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const subs = filters.topic ? options.subcategories[filters.topic] ?? [] : [];

  return (
    <section className="rounded-lg border border-line bg-surface" aria-labelledby="practice-heading">
      <div className="border-b border-line px-4 py-3">
        <h2 id="practice-heading" className="text-sm font-semibold">Practice questions (optional)</h2>
        <p className="mt-0.5 text-xs text-muted">
          Readers see these under the article so they can practise what they just learned. Pick up to {MAX} from the problem bank.
        </p>
      </div>

      <div className="space-y-4 p-4">
        {/* Selected */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Selected ({value.length}/{MAX})</p>
          {value.length === 0 ? (
            <p className="mt-2 rounded-md border border-dashed border-line p-3 text-sm text-muted">No questions added yet. Use the filters below to find some.</p>
          ) : (
            <ol className="mt-2 space-y-2">
              {value.map((id, i) => {
                const p = known[id];
                return (
                  <li key={id} className="flex items-center gap-2 rounded-md border border-line bg-surface-2 px-3 py-2 text-sm">
                    <span className="w-5 text-xs tabular-nums text-muted">{i + 1}.</span>
                    <span className="min-w-0 flex-1 truncate font-medium">{p ? p.title : 'Loading…'}</span>
                    {p && <span className={`hidden rounded-full px-2 py-0.5 text-xs font-semibold sm:inline ${DIFF_STYLE[p.difficulty]}`}>{DIFFICULTY_LABEL[p.difficulty]}</span>}
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="rounded px-1.5 py-0.5 hover:bg-line disabled:opacity-30">↑</button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Move down" className="rounded px-1.5 py-0.5 hover:bg-line disabled:opacity-30">↓</button>
                    <button type="button" onClick={() => remove(id)} aria-label="Remove question" className="rounded px-1.5 py-0.5 text-hard hover:bg-line">×</button>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Filters */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Find questions</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <select aria-label="Category" value={filters.topic} onChange={(e) => setFilter({ topic: e.target.value, subcategory: '' })} className={inputCls}>
              <option value="">All categories</option>
              {options.topics.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
            </select>
            <select aria-label="Sub-category" value={filters.subcategory} onChange={(e) => setFilter({ subcategory: e.target.value })} disabled={!subs.length} className={`${inputCls} disabled:opacity-50`}>
              <option value="">{subs.length ? 'All sub-categories' : 'Sub-category'}</option>
              {subs.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select aria-label="Difficulty" value={filters.difficulty} onChange={(e) => setFilter({ difficulty: e.target.value })} className={inputCls}>
              <option value="">Any difficulty</option>
              {DIFFICULTIES.map((d) => <option key={d} value={d}>{DIFFICULTY_LABEL[d]}</option>)}
            </select>
            <select aria-label="Question type" value={filters.type} onChange={(e) => setFilter({ type: e.target.value })} className={inputCls}>
              <option value="">Any type</option>
              {PROBLEM_TYPES.map((t) => <option key={t} value={t}>{typeLabel(t)}</option>)}
            </select>
          </div>
          <input
            type="search"
            aria-label="Search questions"
            value={filters.q}
            onChange={(e) => setFilter({ q: e.target.value })}
            placeholder="Search by title or keyword, e.g. chunking, latency, RAG"
            className={`${inputCls} mt-2`}
          />
        </div>

        {/* Results */}
        <div>
          <p className="text-xs text-muted" role="status">
            {results.loading ? 'Searching…' : results.error ? '' : `${results.total} question${results.total === 1 ? '' : 's'} found${results.total > results.items.length ? ` (showing the first ${results.items.length}, narrow the filters to see others)` : ''}`}
          </p>
          {results.error && <p className="text-sm text-hard">{results.error}</p>}
          <ul className="mt-2 max-h-80 space-y-1.5 overflow-y-auto pr-1">
            {results.items.map((p) => {
              const added = value.includes(p.id);
              return (
                <li key={p.id} className="flex items-center gap-3 rounded-md border border-line px-3 py-2 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.title}</p>
                    <p className="truncate text-xs text-muted">{p.topic}{p.subcategory ? ` · ${p.subcategory}` : ''} · {typeLabel(p.type)}</p>
                  </div>
                  <span className={`hidden rounded-full px-2 py-0.5 text-xs font-semibold sm:inline ${DIFF_STYLE[p.difficulty]}`}>{DIFFICULTY_LABEL[p.difficulty]}</span>
                  <button
                    type="button"
                    onClick={() => (added ? remove(p.id) : add(p))}
                    disabled={!added && value.length >= MAX}
                    className={`shrink-0 rounded-md border px-3 py-1 text-xs font-semibold disabled:opacity-40 ${added ? 'border-accent bg-accent-soft text-ink' : 'border-line hover:bg-surface-2'}`}
                  >
                    {added ? 'Added ✓' : 'Add'}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}