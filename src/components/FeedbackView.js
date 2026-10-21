import Markdown from './Markdown';
import { AI_RUBRIC, AI_RUBRIC_LABEL } from '@/lib/constants';

const BANDS = [
  { min: 85, label: 'Excellent', cls: 'text-easy' },
  { min: 70, label: 'Good', cls: 'text-easy' },
  { min: 50, label: 'Partial', cls: 'text-medium' },
  { min: 0, label: 'Needs work', cls: 'text-hard' },
];

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

export default function FeedbackView({ evaluation }) {
  const { score, scores, feedback: f = {}, model, createdAt } = evaluation;
  const band = BANDS.find((b) => score >= b.min);
  const strengths = f.strengths ?? [];
  const missing = f.missing ?? [];
  const inaccuracies = f.inaccuracies ?? [];
  const howToImprove = f.howToImprove ?? [];
  const followUps = f.followUps ?? [];

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
      </div>

      {f.summary && (
        <div className="mt-5 text-sm">
          <Markdown>{f.summary}</Markdown>
        </div>
      )}

      {strengths.length > 0 && (
        <Section title="What you got right">
          <Bullets items={strengths} />
        </Section>
      )}

      {missing.length > 0 && (
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

      {f.reasoningFeedback && (
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
        AI-generated feedback, 
        {createdAt ? `, ${new Date(createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}` : ''}. It can make
        mistakes and is not a prediction of interview results. Compare it with the reference answer below.
      </p>
    </div>
  );
}