import Link from 'next/link';
import { Flame, Mic, Terminal } from './icons';

// Three promo cards at the top of the problem list, like the banners on LeetCode's problemset.
export default function Banners({ signedIn }) {
  const cards = [
    {
      href: signedIn ? '/dashboard' : '/register',
      title: signedIn ? 'Keep your streak going' : 'Create a free account',
      body: signedIn ? 'See your streak, progress and saved answers.' : 'Track progress, streaks and saved answers.',
      icon: <Flame width={22} height={22} />,
      cls: 'bg-gradient-to-br from-[#34d67b] to-[#1fae5a] text-[#04140a] border-transparent',
      sub: 'text-[#04140a]/70',
    },
    {
      href: '/problems?difficulty=EASY',
      title: 'Warm up with Easy',
      body: 'Short questions you can talk through out loud.',
      icon: <Mic width={22} height={22} className="text-accent" />,
      cls: 'panel',
      sub: 'text-muted',
    },
    {
      href: '/problems?type=SYSTEM_DESIGN',
      title: 'System design',
      body: 'Scenario questions for senior AI engineer roles.',
      icon: <Terminal width={22} height={22} className="text-accent" />,
      cls: 'panel',
      sub: 'text-muted',
    },
  ];

  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {cards.map((c) => (
        <li key={c.title}>
          <Link
            href={c.href}
            className={`flex h-full min-h-28 flex-col justify-between rounded-lg border p-4 transition-transform hover:-translate-y-0.5 ${c.cls}`}
          >
            {c.icon}
            <span>
              <span className="block text-base font-semibold leading-snug">{c.title}</span>
              <span className={`mt-0.5 block text-sm ${c.sub}`}>{c.body}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}