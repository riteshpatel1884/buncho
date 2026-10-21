import { SKILLS } from './skills';

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Word-boundary match that also works for terms such as "a/b testing" or "ci/cd".
const patterns = SKILLS.map((skill) => ({
  skill,
  re: new RegExp(`(?<![a-z0-9])(?:${skill.aliases.map((a) => escape(a.toLowerCase())).join('|')})(?![a-z0-9])`, 'g'),
}));

const OPTIONAL_HEADING = /^\W*(nice[- ]to[- ]have|preferred( qualifications| skills)?|bonus( points)?|good to have|desirable|plus(es)?|optional)\b/i;
const REQUIRED_HEADING = /^\W*(requirements?|required( qualifications| skills)?|qualifications|must[- ]have|minimum qualifications|what you('| wi)ll (do|bring|need)|responsibilit(y|ies)|key skills|you have|about you|skills)\b/i;
const OPTIONAL_INLINE = /\b(nice to have|preferred|a plus|is a plus|bonus|good to have|desirable|familiarity with|exposure to)\b/i;

/**
 * Reads a pasted job description and returns the skills it asks for.
 * A skill is "core" if it appears in a required section. A skill that only appears
 * under nice-to-have lines is "supporting".
 */
export function extractSkills(jdText) {
  const lines = String(jdText ?? '').split(/\r?\n/);
  const found = new Map();
  let mode = 'required';

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const isHeading = line.length < 60 && !/[.;]$/.test(line);
    if (isHeading && OPTIONAL_HEADING.test(line)) mode = 'optional';
    else if (isHeading && REQUIRED_HEADING.test(line)) mode = 'required';

    const lineMode = mode === 'optional' || OPTIONAL_INLINE.test(line) ? 'optional' : 'required';
    const lower = line.toLowerCase();

    for (const { skill, re } of patterns) {
      re.lastIndex = 0;
      const hits = lower.match(re);
      if (!hits) continue;
      const entry = found.get(skill.key) ?? { key: skill.key, label: skill.label, mentions: 0, required: 0, optional: 0, evidence: [] };
      entry.mentions += hits.length;
      entry[lineMode] += 1;
      if (entry.evidence.length < 2) entry.evidence.push(line.length > 140 ? `${line.slice(0, 137)}…` : line);
      found.set(skill.key, entry);
    }
  }

  return [...found.values()]
    .map((e) => {
      const importance = e.required > 0 ? 'core' : 'supporting';
      // Core skills weigh 3x; repeated mentions add a little more (capped)
      const weight = (importance === 'core' ? 3 : 1) * (1 + Math.min(e.mentions - 1, 3) * 0.25);
      return { ...e, importance, weight };
    })
    .sort((a, b) => b.weight - a.weight || a.label.localeCompare(b.label));
}

/** Best-effort job title from the first short line of the description. */
export function guessTitle(jdText) {
  const first = String(jdText ?? '').split(/\r?\n/).map((l) => l.trim()).find(Boolean) ?? '';
  return first.length >= 4 && first.length <= 90 ? first.replace(/^(job title|role|position)\s*[:\-]\s*/i, '') : '';
}
