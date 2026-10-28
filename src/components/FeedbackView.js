import Markdown from './Markdown';
import { AI_RUBRIC, AI_RUBRIC_LABEL } from '@/lib/constants';

// Score at or above this means the answer is interview ready
const READY_SCORE = 75;

const BANDS = [
  { min: 85, label: 'Excellent', cls: 'text-easy' },
  { min: READY_SCORE, label: 'Good', cls: 'text-easy' },
  { min: 50, label: 'Partial', cls: 'text-medium' },
  { min: 0, label: 'Needs work', cls: 'text-hard' },
];

// Shown under the score. Pick the first entry whose min the score reaches.
const READINESS = [
  {
    min: 85,
    range: '85–100',
    title: 'Interview ready',
    text: 'Strong answer. You would do well with this in a real interview. Skim the follow-up questions below to stay sharp.',
    cls: 'text-easy',
    dot: 'bg-easy',
  },
  {
    min: READY_SCORE,
    range: '75–84',
    title: 'Interview ready',
    text: 'You can relax: answers scoring 75 or more are interview ready. The tips below are only polish.',
    cls: 'text-easy',
    dot: 'bg-easy',
  },
  {
    min: 60,
    range: '60–74',
    title: 'Almost there',
    text: 'A few more points and this is interview ready (75+). Cover what is missing below and try again.',
    cls: 'text-medium',
    dot: 'bg-medium',
  },
  {
    min: 40,
    range: '40–59',
    title: 'Needs improvement',
    text: 'Good start, but not interview ready yet. Work through "What\'s missing" and rewrite your answer.',
    cls: 'text-medium',
    dot: 'bg-medium',
  },
  {
    min: 0,
    range: '0–39',
    title: 'Needs more work',
    text: 'Read the reference solution first, then rewrite the answer in your own words.',
    cls: 'text-hard',
    dot: 'bg-hard',
  },
];

const RESULT = {
  met: { mark: '✓', label: 'Met', cls: 'text-easy' },
  partial: { mark: '◐', label: 'Partly met', cls: 'text-medium' },
  missed: { mark: '✕', label: 'Missed', cls: 'text-hard' },
};

function Section({ title, children }) {
  return (
    <section className="mt-6">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function Bullets({ items }) {
  return (
    <ul className="space-y-2 text-sm">
      {items.map((t, i) => (
        <li key={i} className="flex gap-2">
          <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted" />
          <div className="min-w-0">
            <Markdown>{t}</Markdown>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function FeedbackView({ evaluation, rubric = [] }) {
  const { score, scores, feedback: f = {}, model, createdAt } = evaluation;
  const band = BANDS.find((b) => score >= b.min);
  // Above 75: show only "How to improve" and "Follow-up questions"
  const showDetails = score <= 75;
  const ready = READINESS.find((r) => score >= r.min);
  const strengths = f.strengths ?? [];
  const missing = f.missing ?? [];
  const inaccuracies = f.inaccuracies ?? [];
  const howToImprove = f.howToImprove ?? [];
  const followUps = f.followUps ?? [];
  const results = new Map((f.rubricResults ?? []).map((r) => [r.id, r]));
  const checklist = rubric.filter((r) => results.has(r.id));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg bg-surface-2 p-4">
        <div>
          <p className={`text-3xl font-semibold tabular-nums ${band.cls}`}>
            {score}
            <span className="text-base font-medium text-muted">/100</span>
          </p>
          <p className={`text-sm font-semibold ${band.cls}`}>{band.label}</p>
        </div>
        <ul className="grid min-w-48 flex-1 gap-2">
          {Object.entries(AI_RUBRIC).map(([k, max]) => (
            <li key={k}>
              <div className="flex justify-between text-xs text-muted">
                <span>{AI_RUBRIC_LABEL[k]}</span>
                <span className="tabular-nums">
                  {scores?.[k] ?? 0}/{max}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-accent" style={{ width: `${((scores?.[k] ?? 0) / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>

        {/* Interview readiness, based on the score */}
        <div className="flex basis-full items-start gap-2.5 border-t border-line pt-3">
          <span aria-hidden="true" className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${ready.dot}`} />
          <p className="min-w-0 text-sm">
            <span className={`font-semibold ${ready.cls}`}>{ready.title}</span>
            <span className="ml-2 text-xs text-muted tabular-nums">Score {ready.range}</span>
            <span className="mt-0.5 block text-muted">{ready.text}</span>
          </p>
        </div>
      </div>

      {f.summary && (
        <div className="mt-5 text-sm">
          <Markdown>{f.summary}</Markdown>
        </div>
      )}

      {checklist.length > 0 && (
        <Section title="Rubric checklist">
          <ul className="space-y-2">
            {checklist.map((r) => {
              const res = results.get(r.id);
              const v = RESULT[res.result];
              return (
                <li key={r.id} className="flex gap-3 rounded-lg border border-line p-3 text-sm">
                  <span className={`mt-0.5 w-4 shrink-0 text-center font-semibold ${v.cls}`} aria-hidden="true">
                    {v.mark}
                  </span>
                  <div className="min-w-0">
                    <p>
                      <span className="sr-only">{v.label}: </span>
                      {r.criterion}
                    </p>
                    {res.note && <p className="mt-1 text-xs text-muted">{res.note}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      {showDetails && strengths.length > 0 && (
        <Section title="What you got right">
          <Bullets items={strengths} />
        </Section>
      )}

      {showDetails && missing.length > 0 && (
        <Section title="What's missing">
          <Bullets items={missing} />
        </Section>
      )}

      {inaccuracies.length > 0 && (
        <Section title="Technical issues">
          <ul className="space-y-3 text-sm">
            {inaccuracies.map((x, i) => (
              <li key={i} className="rounded-lg border border-line p-3">
                <p>
                  <span className="font-medium text-hard">You wrote: </span>
                  {x.claim}
                </p>
                <p className="mt-1">
                  <span className="font-medium text-easy">Better: </span>
                  {x.correction}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {showDetails && f.reasoningFeedback && (
        <Section title="Reasoning">
          <div className="text-sm">
            <Markdown>{f.reasoningFeedback}</Markdown>
          </div>
        </Section>
      )}

      {howToImprove.length > 0 && (
        <Section title="How to improve your answer">
          <Bullets items={howToImprove} />
        </Section>
      )}

      {followUps.length > 0 && (
        <Section title="Follow-up questions an interviewer might ask">
          <Bullets items={followUps} />
        </Section>
      )}

      <p className="mt-8 text-xs text-muted">
        {createdAt ? `${new Date(createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}` : ''}. AI-generated feedback can make
        mistakes and is not a prediction of interview results. Compare it with the reference answer below.
      </p>
    </div>
  );
}