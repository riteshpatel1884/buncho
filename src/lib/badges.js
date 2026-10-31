/* ------------------------------------------------------------------ */
/* Badges. Everything is computed from real activity, nothing is       */
/* stored, so a badge can never drift from the numbers behind it.      */
/* Pure data and helpers: safe to import in server and client code.    */
/* ------------------------------------------------------------------ */

/** Problem-count milestones, in order. */
export const MILESTONES = [10, 25, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600];

const MILESTONE_NAMES = {
  10: 'Neuron',
  25: 'Perceptron',
  50: 'Gradient',
  100: 'Tensor',
  150: 'Embedding',
  200: 'Transformer',
  250: 'Attention',
  300: 'Fine-tuner',
  350: 'Agent',
  400: 'Orchestrator',
  450: 'Architect',
  500: 'Oracle',
  550: 'Frontier',
  600: 'Singularity',
};

// Every milestone gets its own shape + colour combination (14 milestones, 7 shapes, 7 tiers).
const TIER_ORDER = ['bronze', 'silver', 'gold', 'emerald', 'sapphire', 'amethyst', 'ruby'];
const SHAPE_ORDER = ['circle', 'hexagon', 'shield', 'octagon', 'diamond', 'burst', 'seal'];

const MILESTONE_BADGES = MILESTONES.map((n, i) => ({
  id: `solved-${n}`,
  kind: 'milestone',
  threshold: n,
  name: MILESTONE_NAMES[n],
  desc: `Solved ${n} problems`,
  tier: TIER_ORDER[Math.floor(i / 2)],
  shape: SHAPE_ORDER[i % SHAPE_ORDER.length],
  test: (m) => m.solved >= n,
}));

const ACHIEVEMENT_BADGES = [
  { id: 'first', name: 'Ignition', desc: 'Solved your first problem', tier: 'emerald', shape: 'circle', glyph: 'spark', test: (m) => m.solved >= 1 },
  { id: 'streak7', name: 'Blaze', desc: 'Reached a 7 day streak', tier: 'ember', shape: 'hexagon', glyph: 'flame', test: (m) => m.streak >= 7 },
  { id: 'streak30', name: 'Inferno', desc: 'Reached a 30 day streak', tier: 'ruby', shape: 'burst', glyph: 'inferno', test: (m) => m.streak >= 30 },
  { id: 'hard', name: 'Summit', desc: 'Solved 5 hard problems', tier: 'sapphire', shape: 'diamond', glyph: 'peak', test: (m) => m.hard >= 5 },
  { id: 'scholar', name: 'Prodigy', desc: 'Average AI score of 80+ over 5 answers', tier: 'amethyst', shape: 'seal', glyph: 'cap', test: (m) => m.evals >= 5 && m.avgScore >= 80 },
  { id: 'helper', name: 'Mentor', desc: 'Got 10 helpful votes on shared answers', tier: 'ruby', shape: 'circle', glyph: 'heart', test: (m) => m.helpful >= 10 },
  { id: 'sharer', name: 'Beacon', desc: 'Shared 3 answers publicly', tier: 'sapphire', shape: 'octagon', glyph: 'wave', test: (m) => m.shared >= 3 },
  { id: 'regular', name: 'Clockwork', desc: 'Practised on 20 different days', tier: 'silver', shape: 'hexagon', glyph: 'calendar', test: (m) => m.activeDays >= 20 },
  { id: 'pro', name: 'Patron', desc: 'Supports Buncho with Pro', tier: 'gold', shape: 'shield', glyph: 'crown', test: (m) => m.pro },
].map((b) => ({ kind: 'achievement', ...b }));

const ALL = [...MILESTONE_BADGES, ...ACHIEVEMENT_BADGES].map((b, i) => ({ ...b, fx: i }));

/** Every badge with an `earned` flag. m = { solved, streak, hard, evals, avgScore, helpful, shared, activeDays, pro } */
export const badgeList = (m) => ALL.map(({ test, ...b }) => ({ ...b, earned: Boolean(test(m)) }));

/** Earned badges, most impressive first: highest milestone, then the achievements. */
export function sortEarned(badges) {
  const earned = badges.filter((b) => b.earned);
  return [
    ...earned.filter((b) => b.kind === 'milestone').sort((a, b) => b.threshold - a.threshold),
    ...earned.filter((b) => b.kind === 'achievement'),
  ];
}

/**
 * Where the user is on the milestone path.
 * reached: milestones unlocked, next: the next one (or null), fraction: progress between the last and next one (0..1),
 * line: how far along the connecting line the progress bar should reach (0..1, first to last medal).
 */
export function milestoneProgress(solved) {
  const n = MILESTONES.length;
  const reached = MILESTONES.filter((t) => solved >= t).length;
  if (reached >= n) return { reached, next: null, prev: MILESTONES[n - 1], fraction: 1, toNext: 0, line: 1 };
  const prev = reached === 0 ? 0 : MILESTONES[reached - 1];
  const nextT = MILESTONES[reached];
  const fraction = Math.max(0, Math.min(1, (solved - prev) / (nextT - prev)));
  const line = reached === 0 ? 0 : (reached - 1 + fraction) / (n - 1);
  return { reached, next: MILESTONE_BADGES[reached], prev, fraction, toNext: nextT - solved, line };
}