import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getOrCreateUser } from '@/lib/user';
import JobForm from '@/components/jobs/JobForm';
import { getEntitlements } from '@/lib/subscription';
import { BackLink, Eyebrow, Gradient, Hero, card, ctaBtn } from '@/components/jobs/ui';
import { Check, FileText, Flask, Lock, Tag } from '@/components/icons';
import { FREE_ROLE_LIMIT, PRO_PRICE_INR } from '@/lib/constants';

export const metadata = { title: 'Add a role' };

const STEPS = [
  { icon: FileText, title: 'We read the description', text: 'The text is scanned for the AI and ML skills the role asks for.' },
  { icon: Tag, title: 'Skills meet the question bank', text: 'Each skill is matched to reviewed questions already in the bank.' },
  { icon: Flask, title: 'You get a practice plan', text: 'Easier questions first, with a timed mock assessment when you are ready.' },
];

const TIPS = [
  'Paste the responsibilities and the requirements sections.',
  'Include tools and frameworks the posting mentions.',
  'Remove anything personal, such as recruiter contact details.',
];

export default async function NewJobPage() {
  const user = await getOrCreateUser();
  if (!user) redirect('/login');
  const ent = await getEntitlements(user.id);

  if (!ent.roles.canAdd) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 pb-20 pt-6 sm:px-6">
        <BackLink href="/jobs">Job preparation</BackLink>
        <div className="mt-3 rounded-3xl border border-line bg-surface p-8 text-center sm:p-12">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent-soft text-accent"><Lock width={26} height={26} /></span>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">Your free role is in use</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            The free plan includes {FREE_ROLE_LIMIT} role preparation plan. Delete it to start a new one, or upgrade to Pro and keep a plan for every job you apply to.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/pricing" className={ctaBtn}>Upgrade to Pro · ₹{PRO_PRICE_INR}</Link>
            <Link href="/jobs" className="inline-flex items-center rounded-full border border-line px-5 py-3 text-sm font-semibold hover:border-muted">Back to my role</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6">
      <BackLink href="/jobs">Job preparation</BackLink>

      <Hero className="mt-3" aria-labelledby="new-h1">
        <div className="px-6 py-9 sm:px-10 sm:py-12">
          <Eyebrow>New role</Eyebrow>
          <h1 id="new-h1" className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Add a role, get a <Gradient>plan in seconds</Gradient>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted">
            We look for AI and ML skills in the text and match them to questions already in the bank. Skills the bank cannot test yet are shown as gaps, not padded with unrelated questions.
          </p>
        </div>
      </Hero>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <JobForm />

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <section aria-labelledby="next-h" className={`${card} p-5`}>
            <h2 id="next-h" className="text-base font-semibold">What happens next</h2>
            <ol className="mt-4 space-y-4">
              {STEPS.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="flex gap-3">
                  <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                    <Icon width={20} height={20} />
                    <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-accent text-[0.6rem] font-bold text-accent-ink">{i + 1}</span>
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="mt-0.5 text-xs text-muted">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="tips-h" className={`${card} p-5`}>
            <h2 id="tips-h" className="text-base font-semibold">For the best results</h2>
            <ul className="mt-3 space-y-2.5">
              {TIPS.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-muted">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-accent-soft text-accent"><Check width={10} height={10} strokeWidth={3.5} /></span>
                  {t}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}