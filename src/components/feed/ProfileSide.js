import Link from "next/link";
import Avatar from "../Avatar";
import { BlueTick, OfficialTick } from "../Badges";
import AuthorFollow from "./AuthorFollow";
import { TOPICS } from "@/lib/feed/feed";

const DOTS = {
  backgroundImage: "radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--on-navy) 22%, transparent) 1px, transparent 0)",
  backgroundSize: "14px 14px",
};

function ProfileCard({ p, signedIn, returnTo }) {
  // Experts have a fuller page with their sessions; students and the team have only this card.
  const link = p.isAdmin
    ? p.isMe ? { href: "/onboarding/admin/profile", label: "Edit profile" } : null
    : p.slug
      ? { href: `/experts/${p.slug}`, label: p.isMe ? "View profile" : "Full profile" }
      : p.isMe ? { href: "/dashboard/profile", label: "Edit profile" } : null;

  return (
    <section className="card overflow-hidden">
      <div className="h-20 bg-navy sm:h-24" style={DOTS} aria-hidden="true" />
      <div className="px-4 pb-5 sm:px-5">
        <div className="-mt-10 flex items-end justify-between gap-3">
          <div className="rounded-[28%] bg-surface p-1">
            <Avatar name={p.name} src={p.avatarUrl} color={p.avatarColor} icon={p.avatarIcon} admin={p.isAdmin} size={80} />
          </div>
          {link && <Link href={link.href} className="btn-outline !rounded-full !px-4 !py-1.5">{link.label}</Link>}
        </div>

        <h2 className="mt-2 flex w-fit max-w-full items-center gap-1 font-display text-xl leading-tight">
          <span className="min-w-0 break-words">{p.name || "Buncho member"}</span>
          {p.isAdmin ? <OfficialTick className="h-5 w-5 shrink-0" /> : p.blueTick && <BlueTick className="h-5 w-5 shrink-0" />}
        </h2>
        {p.username && <p className="text-sm text-muted">@{p.username}</p>}
        <p className="mt-1.5 text-sm">{p.roleLine}</p>
        {p.headline && <p className="mt-1.5 break-words text-sm text-muted">{p.headline}</p>}
        {p.verified && (
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-mint-soft px-2.5 py-0.5 text-xs font-semibold text-mint">✓ Verified by Buncho</span>
        )}

        <AuthorFollow
          authorId={p.id}
          initialFollowing={p.viewerFollows}
          initialFollowers={p.followers}
          posts={p.postCount}
          following={p.followingCount}
          signedIn={signedIn}
          mine={p.isMe}
          canFollow={!p.isAdmin}
          returnTo={returnTo}
        />
      </div>
    </section>
  );
}

function JoinCard({ returnTo }) {
  return (
    <section className="card p-5">
      <p className="font-display text-lg leading-snug">Join the conversation</p>
      <p className="mt-1 text-sm text-muted">Post, follow experts and save what you want to read later.</p>
      <Link href="/sign-up" className="btn-primary mt-4 w-full !rounded-full">Join Buncho</Link>
      <Link href={`/sign-in?redirect_url=${encodeURIComponent(returnTo)}`} className="mt-2 block text-center text-sm font-medium text-muted hover:text-brand">
        I already have an account
      </Link>
    </section>
  );
}

function TagsCard({ counts }) {
  return (
    <section className="card p-4">
      <h2 className="mb-3 px-1 font-display text-base">Topics</h2>
      <ul className="flex flex-wrap gap-2">
        {Object.entries(TOPICS).map(([key, label]) => (
          <li key={key}>
            <Link href={`/feed?topic=${key}`} className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-[13px] font-semibold text-brand transition-colors hover:bg-brand hover:text-on-brand">
              #{label}
              <span className="text-xs font-medium tabular-nums opacity-70">{counts.get(key) ?? 0}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Left column of a post page and of a public profile page:
// the person's profile, then "Join the conversation" (only when the visitor is signed out), then all topics.
export default function ProfileSide({ profile, signedIn, returnTo, topicCounts }) {
  return (
    <div className="space-y-4">
      <ProfileCard p={profile} signedIn={signedIn} returnTo={returnTo} />
      {!signedIn && <JoinCard returnTo={returnTo} />}
      <TagsCard counts={topicCounts} />
    </div>
  );
}
