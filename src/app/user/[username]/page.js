import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { after } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { findProfileUser, getProfileData, publicName } from '@/lib/profile';
import { profileTheme } from '@/lib/profile-theme';
import { absoluteUrl, buildMetadata, graph, truncate } from '@/lib/seo';
import ActivityChart from '@/components/dashboard/ActivityChart';
import { dayKey } from '@/lib/problems';
import JsonLd from '@/components/JsonLd';
import { Crown } from '@/components/ProBadge';
import StatTile from '@/components/dashboard/StatTile';
import BadgeGrid from '@/components/profile/BadgeGrid';
import LevelCard from '@/components/profile/LevelCard';
import ShareProfile from '@/components/profile/ShareProfile';
import SkillRadar from '@/components/profile/SkillRadar';

const formatDate = (d) => d.toLocaleDateString('en-IN', { dateStyle: 'medium', timeZone: 'Asia/Kolkata' });

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|discord|slack|embed|headless/i;

export async function generateMetadata({ params }) {
  const { username } = await params;
  const user = await findProfileUser(username);
  if (!user) return { title: 'Profile not found', robots: { index: false, follow: false } };

  const name = publicName(user);
  const path = `/user/${user.username}`;
  // The profile is only worth indexing when it is public and has something on it
  const data = user.profilePublic ? await getProfileData(user) : null;
  const solved = data?.stats?.solved ?? 0;
  const worthIndexing = Boolean(user.profilePublic && solved > 0);

  const description = truncate(
    user.headline
      ? `${user.headline}. ${solved ? `${solved} AI interview problems solved on Buncho.` : 'Practising AI interviews on Buncho.'}`
      : `${name} (@${user.username}) is practising AI, ML and GenAI interview questions on Buncho${solved ? `, with ${solved} problems solved` : ''}.`,
    155,
  );

  return buildMetadata({
    title: `${name} (@${user.username})`,
    description,
    path,
    image: `${path}/opengraph-image`,
    imageAlt: `${name}'s Buncho profile`,
    type: 'profile',
    noindex: !worthIndexing,
  });
}

function Pill({ href, children, external = true }) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer nofollow' } : {})}
      className="rounded-full border border-line bg-surface px-3 py-1 text-sm font-medium transition hover:border-accent hover:text-accent"
    >
      {children}
    </a>
  );
}

export default async function PublicProfilePage({ params }) {
  const { username } = await params;
  const user = await findProfileUser(username);
  if (!user) notFound();

  const viewer = await getOrCreateUser();
  const isOwner = Boolean(viewer && viewer.id === user.id);
  // A private profile looks like a missing one to everybody except its owner
  if (!user.profilePublic && !isOwner) notFound();

  const data = await getProfileData(user);
  const theme = profileTheme(user.username);
  const url = absoluteUrl(`/user/${user.username}`);
  const name = data.name;

  // Count the visit after the response is sent, and skip the owner and obvious bots
  if (!isOwner) {
    const ua = (await headers()).get('user-agent') ?? '';
    if (ua && !BOT.test(ua)) {
      after(async () => {
        try {
          await prisma.$executeRaw`UPDATE "User" SET "profileViews" = "profileViews" + 1 WHERE "id" = ${user.id}`;
        } catch (err) {
          console.error('[profile] view count failed', err);
        }
      });
    }
  }

  const { stats, level } = data;
  const links = [
    user.website && { href: user.website, label: user.website.replace(/^https?:\/\/(www\.)?/, '') },
    user.githubHandle && { href: `https://github.com/${user.githubHandle}`, label: 'GitHub' },
    user.linkedinHandle && { href: `https://www.linkedin.com/in/${user.linkedinHandle}`, label: 'LinkedIn' },
    user.xHandle && { href: `https://x.com/${user.xHandle}`, label: 'X' },
  ].filter(Boolean);

  const evaluatedTopics = data.topics.filter((t) => t.avg != null);
  const showRadar = evaluatedTopics.length >= 3;
  const maxSolved = Math.max(1, ...data.topics.map((t) => t.solved));
  const hasAnything = Boolean(stats);

  const ring = data.pro ? 'bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600' : '';

  return (
    <div className="mx-auto w-full max-w-[64rem] px-4 pb-16 pt-4 sm:px-6">
      <JsonLd
        data={graph({
          '@type': 'ProfilePage',
          '@id': `${url}#page`,
          url,
          name: `${name} (@${user.username})`,
          mainEntity: {
            '@type': 'Person',
            name,
            alternateName: user.username,
            url,
            ...(user.headline && { description: user.headline }),
            ...(user.imageUrl && { image: user.imageUrl }),
            ...(links.length && { sameAs: links.map((l) => l.href) }),
          },
        })}
      />

      {!user.profilePublic && isOwner && (
        <p role="status" className="mb-4 rounded-xl border border-amber-400/50 bg-amber-400/10 px-4 py-3 text-sm">
          Only you can see this page, because your profile is set to private.{' '}
          <Link href="/settings/profile" className="font-semibold underline underline-offset-2">Make it public</Link>
        </p>
      )}

      {/* Banner: colours are derived from the username, so every profile looks different */}
      <header>
        <div className="relative h-40 overflow-hidden rounded-3xl sm:h-56" style={{ background: theme.banner }}>
          <div aria-hidden="true" className="absolute inset-0 opacity-70" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.28) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/40 to-transparent" />
          {data.pro && (
            <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300 backdrop-blur">
              <Crown width={12} height={12} /> Pro member
            </span>
          )}
        </div>

        <div className="relative -mt-14 px-2 sm:-mt-16 sm:px-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <span className={`inline-block w-fit rounded-full p-1 ${ring}`} style={data.pro ? undefined : { background: `linear-gradient(135deg, ${theme.a}, ${theme.c})` }}>
              {user.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.imageUrl} alt={`${name}'s avatar`} width={128} height={128} className="h-28 w-28 rounded-full border-4 border-[var(--bg)] object-cover sm:h-32 sm:w-32" />
              ) : (
                <span className="grid h-28 w-28 place-items-center rounded-full border-4 border-[var(--bg)] bg-accent-soft text-4xl font-bold text-accent sm:h-32 sm:w-32">
                  {name.charAt(0).toUpperCase()}
                </span>
              )}
            </span>

            <div className="sm:pb-2">
              {isOwner && (
                <Link href="/settings/profile" className="mb-2 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink hover:opacity-90">
                  Edit profile
                </Link>
              )}
              <ShareProfile url={url} name={name} compact owner={isOwner} />
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{name}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="font-mono text-base text-muted">@{user.username}</span>
              {level && (
                <span className="rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white" style={{ background: `linear-gradient(135deg, ${theme.a}, ${theme.b})` }}>
                  Level {level.index + 1} · {level.name}
                </span>
              )}
            </p>
            {user.headline && <p className="mt-3 text-lg font-medium">{user.headline}</p>}
            {user.bio && <p className="mt-2 max-w-2xl whitespace-pre-line text-[0.95rem] leading-relaxed text-muted">{user.bio}</p>}

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted">
              {user.location && <span className="mr-1">{user.location}</span>}
              <span className="mr-2">Joined {formatDate(user.createdAt)}</span>
              {links.map((l) => (
                <Pill key={l.href} href={l.href}>{l.label}</Pill>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Key numbers */}
      {stats && (
        <dl className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile label="Solved" value={stats.solved} sub={`of ${stats.total} problems`} accent />
          <StatTile label="Day streak" value={stats.streak} sub={stats.streak ? 'Practising daily' : 'Starts with one day'} />
          <StatTile label="Avg AI score" value={data.avgScore ?? '–'} sub={data.avgScore != null ? `over ${data.evals} answer${data.evals === 1 ? '' : 's'}` : 'No AI feedback yet'} />
          <StatTile label="Days practised" value={Object.keys(stats.activeDays).length} sub="different days with activity" />
        </dl>
      )}

      {hasAnything ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0 space-y-8">
            {stats && (
              <section aria-labelledby="skills-h" className="card p-5 sm:p-6">
                <h2 id="skills-h" className="text-base font-semibold tracking-tight">{showRadar ? 'Skill map' : 'Topics practised'}</h2>
                <p className="mt-1 text-sm text-muted">
                  {showRadar ? 'Average AI feedback score per topic, from solved problems.' : 'Solved problems per topic.'}
                </p>
                {data.topics.length === 0 ? (
                  <p className="mt-4 text-sm text-muted">No solved problems yet.</p>
                ) : showRadar ? (
                  <div className="mt-4">
                    <SkillRadar topics={evaluatedTopics} color={theme.a} />
                  </div>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {data.topics.map((t) => (
                      <li key={t.slug}>
                        <div className="flex items-baseline justify-between gap-3 text-sm">
                          <span className="min-w-0 truncate font-medium">{t.name}</span>
                          <span className="shrink-0 tabular-nums text-muted">{t.solved} solved</span>
                        </div>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
                          <div className="h-full rounded-full" style={{ width: `${Math.max(6, (t.solved / maxSolved) * 100)}%`, background: `linear-gradient(90deg, ${theme.a}, ${theme.c})` }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {stats && (
              <ActivityChart
                title="Practice activity"
                activeDays={stats.activeDays}
                todayKey={dayKey(new Date())}
                color={theme.a}
              />
            )}
          </div>

          <aside className="min-w-0 space-y-8">
            {level && <LevelCard level={level} solved={stats.solved} color={theme.a} color2={theme.c} />}
            {stats && <BadgeGrid badges={data.badges} showLocked={isOwner} />}
            {isOwner && (
              <section className="card p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted">Only visible to you</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums">{user.profileViews}</p>
                <p className="text-sm text-muted">profile views</p>
              </section>
            )}
          </aside>
        </div>
      ) : (
        <p className="card mt-8 p-6 text-center text-sm text-muted">{name} keeps the details private for now.</p>
      )}

      {/* Call to action */}
      {!isOwner && (
        <section className="relative mt-10 overflow-hidden rounded-3xl p-6 text-white sm:p-8" style={{ background: theme.banner }}>
          <div aria-hidden="true" className="absolute inset-0 bg-black/35" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Build your own AI interview profile</h2>
              <p className="mt-1 max-w-xl text-sm text-white/85">Practise real AI, ML and GenAI interview questions, get AI feedback and share your progress with a link like this one.</p>
            </div>
            <Link href={viewer ? '/settings/profile' : '/register'} className="shrink-0 rounded-full bg-white px-5 py-2.5 text-center text-sm font-bold text-black hover:opacity-90">
              {viewer ? 'Claim your username' : 'Start free'}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}