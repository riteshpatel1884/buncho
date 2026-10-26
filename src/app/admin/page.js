import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { isAdmin } from '@/lib/admin';

export const metadata = {
  title: 'Admin',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};
export const dynamic = 'force-dynamic';

const ICONS = {
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  billing: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </>
  ),
  blog: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h8" />
    </>
  ),
  reports: (
    <>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <path d="M4 22v-7" />
    </>
  ),
};

function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

export default async function AdminHomePage() {
  const me = await getOrCreateUser();
  if (!isAdmin(me)) notFound(); // don't reveal that the page exists

  const now = new Date();
  // A failed count shows "—" instead of breaking the whole page
  const safe = (p) => p.catch(() => null);
  const [users, activePro, posts, drafts, openAnswers, openSupport] = await Promise.all([
    safe(prisma.user.count()),
    safe(prisma.subscription.count({ where: { currentPeriodEnd: { gt: now } } })),
    safe(prisma.blogPost.count()),
    safe(prisma.blogPost.count({ where: { status: { in: ['DRAFT', 'UNPUBLISHED'] } } })),
    safe(prisma.communityAnswer.count({ where: { reports: { some: { status: 'OPEN' } } } })),
    safe(prisma.supportReport.count({ where: { status: 'OPEN' } })),
  ]);
  const n = (v) => (v === null ? '—' : v.toLocaleString('en-IN'));
  const waiting = (openAnswers ?? 0) + (openSupport ?? 0);

  // To add a new admin page later, add one object here.
  const sections = [
    {
      href: '/admin/users',
      icon: 'users',
      title: 'Users',
      text: 'Everyone who has registered, with plan, join date, activity and payments. Export to CSV.',
      stat: `${n(users)} registered`,
    },
    {
      href: '/admin/billing',
      icon: 'billing',
      title: 'Pricing and offers',
      text: 'Set the Pro price, run offers, create promo codes and check recent payments.',
      stat: `${n(activePro)} active Pro`,
    },
    {
      href: '/admin/blog',
      icon: 'blog',
      title: 'Blog',
      text: 'Write, schedule, edit and publish articles.',
      stat: `${n(posts)} posts · ${n(drafts)} drafts`,
    },
    {
      href: '/admin/reports',
      icon: 'reports',
      title: 'Reports',
      text: 'Problems users report in questions, Pro plan and payment issues, and flagged community answers.',
      stat: waiting ? `${n(waiting)} waiting for review` : 'Nothing waiting',
      attention: waiting > 0,
    },
  ];

  const quick = [
    { href: '/admin/blog/new', label: 'New blog post' },
    { href: '/admin/users/export', label: 'Download all users (CSV)', plain: true },
    { href: '/pricing', label: 'View pricing page' },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Admin</h1>
      <p className="mt-1 text-sm text-muted">Everything you can manage on Buncho, in one place.</p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="group relative flex h-full flex-col rounded-2xl border border-line bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5 sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent">
                  <Icon name={s.icon} />
                </span>
                {s.attention && (
                  <span className="rounded-full bg-hard/12 px-2.5 py-0.5 text-xs font-semibold text-hard">Needs attention</span>
                )}
              </div>
              <h2 className="mt-4 text-lg font-semibold tracking-tight group-hover:text-accent">{s.title}</h2>
              <p className="mt-1 flex-1 text-sm text-muted">{s.text}</p>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3 text-sm">
                <span className={`font-semibold tabular-nums ${s.attention ? 'text-hard' : ''}`}>{s.stat}</span>
                <span className="text-accent transition-transform group-hover:translate-x-0.5" aria-hidden="true">→</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <section aria-labelledby="quick-h" className="mt-10">
        <h2 id="quick-h" className="text-xs font-semibold uppercase tracking-widest text-muted">Quick actions</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {quick.map((q) =>
            q.plain ? (
              <a key={q.href} href={q.href} className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium hover:bg-surface-2">
                {q.label}
              </a>
            ) : (
              <Link key={q.href} href={q.href} className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium hover:bg-surface-2">
                {q.label}
              </Link>
            ),
          )}
        </div>
      </section>

      <p className="mt-10 text-xs text-muted">Only accounts listed in ADMIN_CLERK_IDS can open these pages.</p>
    </div>
  );
}