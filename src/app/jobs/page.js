import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getOrCreateUser } from '@/lib/user';
import { listJobs } from '@/lib/jobs/progress';
import { MAX_JOB_TARGETS } from '@/lib/constants';
import { Bar, barColor } from '@/components/jobs/Parts';
import { Check, ChevronRight, FileText, Flask, Tag } from '@/components/icons';

export const metadata = { title: 'Job preparation' };

// Gradient pairs for the company avatars, picked from the theme colours so light and dark both work
const AVATARS = [
  ['--accent', '--easy'],
  ['--easy', '--accent'],
  ['--medium', '--accent'],
  ['--accent', '--medium'],
];

const avatarFor = (id) => {
  const n = [...String(id)].reduce((s, c) => s + c.charCodeAt(0), 0);
  const [a, b] = AVATARS[n % AVATARS.length];
  return `linear-gradient(135deg, var(${a}), var(${b}))`;
};

const STEPS = [
  { icon: FileText, title: 'Paste the job description', text: 'Drop in the posting for the job or internship you are applying to.' },
  { icon: Tag, title: 'We map the skills', text: 'Buncho reads what the role asks for and matches it to reviewed questions.' },
  { icon: Flask, title: 'Practise and get assessed', text: 'Work through your plan, then take a mock assessment to see where you stand.' },
];

function status(j) {
  if (!j.total) return { label: 'No plan yet', cls: 'bg-surface-2 text-muted' };
  if (j.completed === 0) return { label: 'Not started', cls: 'bg-surface-2 text-muted' };
  if (j.completed >= j.total) return { label: 'Complete', cls: 'bg-easy/15 text-easy' };
  return { label: 'In progress', cls: 'bg-accent-soft text-accent' };
}

function Ring({ pct, size = 60 }) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-sm font-semibold tabular-nums">{pct}%</span>
    </div>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-3.5">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

// Purely decorative preview of what a plan looks like, shown beside the hero on large screens
function PlanPreview() {
  const rows = [
    ['Python', 82],
    ['RAG pipelines', 64],
    ['LLM evaluation', 41],
  ];
  return (
    <div aria-hidden="true" className="relative hidden lg:block">
      <div className="absolute -inset-4 rounded-[2rem] bg-accent/15 blur-2xl" />
      <div className="relative rotate-2 rounded-2xl border border-line bg-surface p-5 shadow-xl shadow-black/10">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl text-sm font-bold text-accent-ink" style={{ background: 'linear-gradient(135deg, var(--accent), var(--easy))' }}>A</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">AI Engineer · Sample</p>
            <p className="text-xs text-muted">12 of 20 questions done</p>
          </div>
          <span className="ml-auto rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">60%</span>
        </div>
        <ul className="mt-5 space-y-3.5">
          {rows.map(([l, v]) => (
            <li key={l}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{l}</span>
                <span className="tabular-nums text-muted">{v}/100</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
                <div className={`h-full rounded-full ${barColor(v)}`} style={{ width: `${v}%` }} />
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-xs">
          <Check width={14} height={14} className="text-accent" strokeWidth={3} />
          <span className="text-muted">Mock assessment score</span>
          <span className="ml-auto font-semibold">78/100</span>
        </div>
      </div>
    </div>
  );
}

function RoleCard({ j }) {
  const pct = j.total ? Math.round((j.completed / j.total) * 100) : 0;
  const st = status(j);
  const initial = (j.company || j.title || '?').trim().charAt(0).toUpperCase();
  const added = new Date(j.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });

  return (
    <li>
      <Link
        href={`/jobs/${j.id}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-xl hover:shadow-black/10"
      >
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100" />

        <div className="flex items-start gap-3.5">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-lg font-bold text-accent-ink" style={{ background: avatarFor(j.id) }} aria-hidden="true">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold leading-snug group-hover:text-accent">{j.title}</h2>
            <p className="mt-0.5 truncate text-sm text-muted">{j.company || 'Company not set'}</p>
          </div>
          <Ring pct={pct} />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.cls}`}>{st.label}</span>
          <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-muted">{j.skillCount} skills</span>
          <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-muted">Added {added}</span>
        </div>

        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-muted">Practice plan</span>
            <span className="font-medium tabular-nums">{j.completed}/{j.total} questions</span>
          </div>
          <Bar value={pct} label={`${j.title} plan progress`} />
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm">
          {j.lastMockScore !== null ? (
            <span className="text-muted">
              Last mock <span className={`ml-1 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums text-ink ${j.lastMockScore >= 70 ? 'bg-easy/15' : j.lastMockScore >= 50 ? 'bg-medium/15' : 'bg-hard/15'}`}>{j.lastMockScore}/100</span>
            </span>
          ) : (
            <span className="text-muted">No mock taken yet</span>
          )}
          <span className="inline-flex items-center gap-1 font-semibold text-accent">
            Open plan <ChevronRight width={16} height={16} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </li>
  );
}

export default async function JobsPage() {
  const user = await getOrCreateUser();
  if (!user) redirect('/login');
  const jobs = await listJobs(user.id);

  const canAdd = jobs.length < MAX_JOB_TARGETS;
  const doneTotal = jobs.reduce((s, j) => s + j.completed, 0);
  const qTotal = jobs.reduce((s, j) => s + j.total, 0);
  const overall = qTotal ? Math.round((doneTotal / qTotal) * 100) : 0;
  const mocks = jobs.map((j) => j.lastMockScore).filter((s) => s !== null);
  const best = mocks.length ? Math.max(...mocks) : null;

  const cta = 'inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-ink shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:opacity-95';

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6">
      {/* Hero */}
      <section
        aria-labelledby="jobs-h1"
        className="relative overflow-hidden rounded-3xl border border-line"
        style={{ background: 'linear-gradient(135deg, var(--accent-soft) 0%, var(--surface) 62%)' }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom_left,black,transparent_70%)]"
          style={{ backgroundImage: 'radial-gradient(var(--line) 1px, transparent 1px)', backgroundSize: '18px 18px' }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-easy/15 blur-3xl" />

        <div className="relative grid items-center gap-10 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-surface/70 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Job preparation
            </span>
            <h1 id="jobs-h1" className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Prepare for the role{' '}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, var(--accent), var(--easy))' }}>
                you actually want
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted">
              Paste a job description. Buncho reads the skills it asks for, matches them to the reviewed question bank and builds a practice plan you can track.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {canAdd ? (
                <Link href="/jobs/new" className={cta}>
                  <span className="text-lg leading-none">+</span> Add a role
                </Link>
              ) : (
                <p className="rounded-full border border-line bg-surface/80 px-4 py-2 text-sm text-muted">
                  You have reached the limit of {MAX_JOB_TARGETS} roles.
                </p>
              )}
              <span className="text-xs text-muted">
                {jobs.length} of {MAX_JOB_TARGETS} roles used
              </span>
            </div>
          </div>
          <PlanPreview />
        </div>
      </section>

      {jobs.length > 0 ? (
        <>
          {/* Overview numbers */}
          <section aria-label="Overview" className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Roles tracked" value={jobs.length} hint={`${MAX_JOB_TARGETS - jobs.length} slots left`} />
            <Stat label="Questions done" value={`${doneTotal}/${qTotal}`} hint="across all plans" />
            <Stat label="Overall progress" value={`${overall}%`} hint={overall >= 100 ? 'All plans complete' : 'keep going'} />
            <Stat label="Best mock score" value={best === null ? '–' : `${best}/100`} hint={best === null ? 'take a mock to see it' : 'your top result'} />
          </section>

          {/* Role cards */}
          <div className="mt-10 flex items-end justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-tight">Your roles</h2>
            <p className="text-xs text-muted">Newest first</p>
          </div>
          <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map((j) => (
              <RoleCard key={j.id} j={j} />
            ))}
            {canAdd && (
              <li>
                <Link
                  href="/jobs/new"
                  className="group flex h-full min-h-[16rem] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-line bg-surface/40 p-6 text-center transition-colors hover:border-accent hover:bg-accent-soft/40"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-accent-soft text-2xl font-light text-accent transition-transform group-hover:scale-110">+</span>
                  <span className="text-sm font-semibold">Add another role</span>
                  <span className="max-w-[14rem] text-xs text-muted">Paste a new job description and get a fresh plan.</span>
                </Link>
              </li>
            )}
          </ul>
        </>
      ) : (
        <section aria-labelledby="how-h" className="mt-10">
          <div className="text-center">
            <h2 id="how-h" className="text-2xl font-semibold tracking-tight">How it works</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
              Add the first job or internship you are applying to and get a plan built from questions you can practise right now.
            </p>
          </div>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="relative overflow-hidden rounded-2xl border border-line bg-surface p-6">
                <span aria-hidden="true" className="absolute -right-2 -top-4 select-none text-8xl font-bold text-surface-2">{i + 1}</span>
                <span className="relative grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent">
                  <Icon width={22} height={22} />
                </span>
                <h3 className="relative mt-4 text-base font-semibold">{title}</h3>
                <p className="relative mt-1.5 text-sm text-muted">{text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 text-center">
            <Link href="/jobs/new" className={cta}>Paste a job description</Link>
          </div>
        </section>
      )}
    </div>
  );
}