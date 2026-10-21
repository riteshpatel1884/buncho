import Link from 'next/link';
import DifficultyBadge from '@/components/DifficultyBadge';
import { Check } from '@/components/icons';
import { TYPE_LABEL } from '@/lib/constants';

export const barColor = (s) => (s >= 70 ? 'bg-easy' : s >= 50 ? 'bg-medium' : 'bg-hard');

export function Bar({ value, label }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={value ?? 0} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className={`h-full rounded-full ${barColor(value ?? 0)}`} style={{ width: `${value ?? 0}%` }} />
    </div>
  );
}

export function SkillRow({ skill }) {
  const gap = skill.bankCoverage === 0;
  return (
    <li>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
        <span className="flex items-center gap-2 font-medium">
          {skill.label}
          <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${skill.importance === 'core' ? 'bg-accent-soft text-accent' : 'bg-surface-2 text-muted'}`}>
            {skill.importance === 'core' ? 'Core' : 'Nice to have'}
          </span>
        </span>
        <span className="text-xs text-muted">
          {gap
            ? 'No questions in the bank yet'
            : skill.score === null
              ? `${skill.done}/${skill.inPlan} done · not assessed`
              : <><span className="font-semibold text-ink">{skill.score}</span>/100 · {skill.done}/{skill.inPlan} done</>}
        </span>
      </div>
      {!gap && <div className="mt-1.5"><Bar value={skill.score ?? 0} label={`${skill.label} score`} /></div>}
    </li>
  );
}

export function PlanRow({ item, number, skillLabels }) {
  const { problem: p } = item;
  const done = item.status === 'COMPLETED';
  return (
    <li>
      <Link href={`/problems/${p.slug}`} className="group flex items-start gap-3 rounded-lg px-3 py-3 odd:bg-surface-2/70 hover:bg-surface-2">
        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center">
          {done ? (
            <span className="grid h-5 w-5 place-items-center rounded-full bg-go text-go-ink"><Check width={13} height={13} strokeWidth={3} /><span className="sr-only">Completed</span></span>
          ) : item.status === 'ATTEMPTED' ? (
            <span className="h-4 w-4 rounded-full border-2 border-accent border-r-transparent"><span className="sr-only">Attempted</span></span>
          ) : (
            <span className="h-4 w-4 rounded-full border-2 border-line"><span className="sr-only">Not started</span></span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium group-hover:text-accent">
            <span className="mr-1.5 tabular-nums text-muted">{number}.</span>{p.title}
            {p.isChallenge && <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-[0.65rem] font-semibold text-accent">Challenge</span>}
          </span>
          <span className="mt-0.5 block text-xs text-muted">
            {item.skillKeys.map((k) => skillLabels[k] ?? k).join(', ')} · {TYPE_LABEL[p.type]} · {p.estimatedMinutes} min
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1">
          <DifficultyBadge difficulty={p.difficulty} plain />
          {item.score !== null && <span className="text-xs tabular-nums text-muted">{item.score}/100</span>}
        </span>
      </Link>
    </li>
  );
}