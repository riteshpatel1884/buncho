const heading = (title) => `### ${title}`;

/** Turns the per-step text boxes into one Markdown answer. Empty steps are left out. */
export function composeSteps(parts, steps) {
  return steps
    .map((s, i) => ((parts[i] ?? '').trim() ? `${heading(s.title)}\n${parts[i].trim()}` : ''))
    .filter(Boolean)
    .join('\n\n');
}

/** Splits a saved answer back into one string per step. Answers without step headings go into step 1. */
export function parseSteps(content, steps) {
  const text = String(content ?? '');
  const out = steps.map(() => '');
  if (!text.trim()) return out;

  const titles = steps.map((s) => heading(s.title));
  const buf = steps.map(() => []);
  let current = -1;
  let matched = false;

  for (const line of text.split('\n')) {
    const idx = titles.indexOf(line.trim());
    if (idx !== -1) {
      current = idx;
      matched = true;
      continue;
    }
    if (current !== -1) buf[current].push(line);
  }

  if (!matched) {
    out[0] = text.trim();
    return out;
  }
  return buf.map((b) => b.join('\n').trim());
}