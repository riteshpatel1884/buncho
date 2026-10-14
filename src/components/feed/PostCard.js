"use client";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Avatar from "../Avatar";
import { BlueTick, OfficialTick } from "../Badges";
import ReportButton from "../ReportButton";
import { showToast } from "../Toast";
import { toggleLike, toggleSave, toggleFollow, loadComments, addComment, deletePost, deleteComment, recordView } from "@/app/feed/actions";
import { TOPICS, MAX_COMMENT, timeAgo, postedLabel, profilePath } from "@/lib/feed/feed";
import { inr } from "@/lib/constants";

const ICON = {
  heart: "M12 21s-7.5-4.6-9.5-9.2C1 8.4 3 5 6.4 5c2 0 3.6 1 4.6 2.6C12 6 13.6 5 15.6 5 19 5 21 8.4 19.5 11.8 19.5 11.8 12 21 12 21z",
  chat: "M4 5h16v11H9l-5 4z",
  mark: "M6 3h12v18l-6-4-6 4z",
  share: "M12 3v12M7 8l5-5 5 5M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
};

// Small particles and a ring that fly out of an icon when it is switched on. `k` restarts it.
function Burst({ k }) {
  if (!k) return null;
  return (
    <span key={k} aria-hidden="true" className="pointer-events-none absolute inset-0">
      <span className="burst-ring" />
      {Array.from({ length: 8 }, (_, i) => <span key={i} className="burst-dot" style={{ "--a": `${i * 45}deg` }} />)}
    </span>
  );
}

function Icon({ name, filled, anim }) {
  return (
    <svg className={anim} width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICON[name]} />
    </svg>
  );
}

// The full post in a pop-up. Bottom sheet on phones, centred card on larger screens.
function Modal({ onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <div className="modal-backdrop fixed inset-0 z-[70] flex items-end justify-center bg-black/50 backdrop-blur-[2px] sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label="Post" className="modal-panel flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-line bg-surface shadow-2xl sm:max-w-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <p className="font-display text-lg">Post</p>
          <button type="button" onClick={onClose} aria-label="Close" className="cursor-pointer rounded-lg p-1 text-muted hover:text-ink">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}

// Asks before anything is deleted, so a mis-click can't remove a post or reply.
function ConfirmDialog({ title, text, confirmLabel, busy, onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      e.stopImmediatePropagation(); // closes only this pop-up, not the post pop-up behind it
      onCancel();
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [onCancel]);

  return createPortal(
    <div className="modal-backdrop fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && !busy && onCancel()}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-text" className="modal-panel w-full max-w-sm rounded-2xl border border-line bg-surface p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            </svg>
          </span>
          <div className="min-w-0">
            <h2 id="confirm-title" className="font-display text-lg">{title}</h2>
            <p id="confirm-text" className="mt-1 text-sm text-muted">{text}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={busy} className="btn-outline">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={busy} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-danger px-5 py-2.5 text-sm font-semibold text-on-brand hover:opacity-90 disabled:opacity-60">
            {busy ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// The line under an author's name, always on one line: "Role at Company" for experts,
// "Student · College" for students (just "Student" when no college is set).
function roleLine(author) {
  if (author.jobTitle && author.company) return `${author.jobTitle} at ${author.company}`;
  if (author.role === "STUDENT") return author.college ? `Student · ${author.college}` : "Student";
  return "Expert";
}

// Small green check for experts whose education or employment Buncho has verified.
function VerifiedMark() {
  return (
    <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-mint-soft text-mint" title="Education or employment verified" role="img" aria-label="Verified">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
    </span>
  );
}

// The "..." menu in a post header. Delete for the author or admin, Report for everyone else.
// The menu stays mounted while closed, so the report pop-up it opens is not removed with it.
function PostMenu({ p, signedIn, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const away = (e) => {
      if (ref.current?.contains(e.target) || e.target.closest?.('[role="dialog"]')) return;
      setOpen(false);
    };
    const key = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  const item = "block w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-surface-2";

  return (
    <div ref={ref} className="relative shrink-0">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-label="More options" aria-haspopup="menu" aria-expanded={open} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></svg>
      </button>
      <div role="menu" className={`${open ? "expand-in" : "hidden"} absolute right-0 top-10 z-20 min-w-40 rounded-xl border border-line bg-surface p-1 shadow-xl`}>
        {p.mine || p.viewerIsAdmin ? (
          <button type="button" role="menuitem" onClick={() => { setOpen(false); onDelete(); }} className={`${item} text-danger`}>
            {p.viewerIsAdmin && !p.mine ? "Delete this post" : "Delete post"}
          </button>
        ) : (
          <ReportButton signedIn={signedIn} kind="person" target={{ id: p.author.id, name: p.author.name, username: p.author.username }} label="Report" className={item} />
        )}
      </div>
    </div>
  );
}

export default function PostCard({ post, signedIn, defaultOpen = false, onDeleted, onChange, focus = false, hideFollow = false }) {
  const router = useRouter();
  const [p, setP] = useState(post);
  const [modal, setModal] = useState(false);
  const [open, setOpen] = useState(defaultOpen);
  const [comments, setComments] = useState(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null); // { type: "post" } or { type: "comment", id }
  const busy = false; // the pop-up closes at once, so it never waits
  const [deleted, setDeleted] = useState(false);
  const [replyTo, setReplyTo] = useState(null); // { id, name } of the comment being answered
  const inputRef = useRef(null);
  const [fx, setFx] = useState({ like: 0, save: 0, share: 0 }); // bumped to replay an effect
  const bump = (name) => setFx((f) => ({ ...f, [name]: f[name] + 1 }));
  const [, startTransition] = useTransition();

  const signIn = `/sign-in?redirect_url=${encodeURIComponent("/feed")}`;
  const long = p.body.length > 320;
  const preview = `${p.body.slice(0, 280).trimEnd()}…`;

  // Tell the list when a like, save, follow or comment count changes, so the normal list and the
  // full-screen viewer never disagree. (Skips the first render; only real changes are reported.)
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    onChange?.(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p]);

  // Count a unique view once the post has really been on screen: mostly visible for a full second.
  // (Opening the page alone doesn't count, and neither does scrolling past it quickly.)
  const cardRef = useRef(null);
  const counted = useRef(false);
  useEffect(() => {
    const el = cardRef.current;
    if (!el || counted.current || post.mine) return;
    try { if (sessionStorage.getItem(`pv:${post.id}`)) { counted.current = true; return; } } catch {}
    let timer;
    const io = new IntersectionObserver(
      ([e]) => {
        const seen = e.isIntersecting && (e.intersectionRatio >= 0.6 || e.intersectionRect.height >= window.innerHeight * 0.5);
        if (!seen) { clearTimeout(timer); timer = undefined; return; }
        if (timer) return;
        timer = setTimeout(async () => {
          counted.current = true;
          io.disconnect();
          const res = await recordView(post.id).catch(() => null);
          if (!res?.ok) { counted.current = false; return; }
          try { sessionStorage.setItem(`pv:${post.id}`, "1"); } catch {}
          if (res.counted) setP((x) => ({ ...x, views: (x.views ?? 0) + 1 }));
        }, 1000);
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] }
    );
    io.observe(el);
    return () => { clearTimeout(timer); io.disconnect(); };
  }, [post.id, post.mine]);

  // Comments load the first time they are needed: the pop-up, the post page, or the comment button.
  useEffect(() => {
    if ((modal || open) && comments === null) loadComments(post.id).then(setComments);
  }, [modal, open, comments, post.id]);

  // Flip the button at once, undo it if the server says no.
  function optimistic(flip, call) {
    setError("");
    setP(flip);
    startTransition(async () => {
      const res = await call();
      if (res?.error) { setP(flip); setError(res.error); }
    });
  }
  const flipLike = (x) => ({ ...x, liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) });
  const flipSave = (x) => ({ ...x, saved: !x.saved });
  const flipFollow = (x) => ({ ...x, following: !x.following, author: { ...x.author, followers: x.author.followers + (x.following ? -1 : 1) } });
  const like = () => {
    if (!p.liked) bump("like");
    optimistic(flipLike, () => toggleLike(p.id));
  };
  const save = () => {
    bump("save");
    showToast(p.saved ? "Removed from saved" : "Saved to your bookmarks", p.saved ? "info" : "save");
    optimistic(flipSave, () => toggleSave(p.id));
  };
  const follow = () => {
    showToast(p.following ? `Unfollowed ${p.author.name}` : `You're following ${p.author.name}`, p.following ? "info" : "success");
    optimistic(flipFollow, () => toggleFollow(p.author.id));
  };

  async function send(e) {
    e.preventDefault();
    setError("");
    const res = await addComment(p.id, draft, replyTo?.id);
    if (res?.error) return setError(res.error);
    setComments((c) => [...(c ?? []), res.comment]);
    setP((x) => ({ ...x, comments: x.comments + 1 }));
    setDraft("");
    setReplyTo(null);
    showToast(replyTo ? `Replied to ${replyTo.name}` : "Comment posted", "success");
  }

  async function share() {
    const url = `${location.origin}/feed/${p.id}`;
    try {
      if (navigator.share) await navigator.share({ url, title: `${p.author.name} on Buncho` });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
        showToast("Link copied to clipboard", "success");
      }
      bump("share");
    } catch {}
  }

  // Runs only after the person confirms in the pop-up.
  // Hides the post or reply at once, then tells the server. If the server refuses, it comes back.
  async function confirmDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setError("");
    setPendingDelete(null);

    if (target.type === "post") {
      setDeleted(true);
      setModal(false);
      onDeleted?.(p.id);
      const res = await deletePost(p.id);
      if (res?.error) {
        setDeleted(false);
        setError(res.error);
        return;
      }
      showToast("Post deleted", "info");
      if (defaultOpen) router.push("/feed"); // on the post's own page there is nothing left to show
      return;
    }

    // Replies under a deleted comment are removed with it on the server.
    const before = comments;
    const gone = new Set([target.id]);
    const list = comments ?? [];
    for (let grew = true; grew; ) {
      grew = false;
      for (const x of list) if (x.parentId && gone.has(x.parentId) && !gone.has(x.id)) { gone.add(x.id); grew = true; }
    }
    const removed = list.filter((x) => gone.has(x.id)).length || 1;
    setComments(list.filter((x) => !gone.has(x.id)));
    setP((x) => ({ ...x, comments: Math.max(0, x.comments - removed) }));
    setReplyTo((r) => (r && gone.has(r.id) ? null : r));

    const res = await deleteComment(target.id);
    if (res?.error) {
      setComments(before);
      setP((x) => ({ ...x, comments: x.comments + removed }));
      setError(res.error);
    } else {
      showToast("Reply deleted", "info");
    }
  }

  const act = "inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 text-sm font-medium tabular-nums transition-[background-color,color,transform] hover:bg-surface-2 active:scale-95";
  // Like and save buttons. A plain function (not a component) so it is not remounted on every render.
  const renderBtn = ({ onClick, on, icon, label, count, fxKey }) =>
    signedIn ? (
      <button type="button" onClick={onClick} aria-pressed={on} className={`${act} ${on ? "text-brand" : "text-muted"} ${icon === "heart" && on ? "!text-[#f43f5e]" : ""}`}>
        <span className="relative inline-flex">
          <Icon name={icon} filled={on} anim={on && fxKey ? (icon === "heart" ? "anim-pop" : "anim-drop") : undefined} key={fxKey} />
          {icon === "heart" && <Burst k={fxKey} />}
        </span>
        {count !== undefined && <span>{count}</span>}<span className="sr-only">{label}</span>
      </button>
    ) : (
      <Link href={signIn} className={`${act} text-muted`}>
        <Icon name={icon} />{count !== undefined && <span>{count}</span>}<span className="sr-only">{label} (sign in)</span>
      </Link>
    );

  // Top-level comments, each followed by every reply beneath it (oldest first).
  const threads = useMemo(() => {
    const list = comments ?? [];
    const byId = new Map(list.map((c) => [c.id, c]));
    const rootOf = (c) => {
      let cur = c, hops = 0;
      while (cur.parentId && byId.has(cur.parentId) && hops++ < 50) cur = byId.get(cur.parentId);
      return cur.id;
    };
    const groups = new Map();
    for (const c of list) {
      const r = rootOf(c);
      if (!groups.has(r)) groups.set(r, []);
      groups.get(r).push(c);
    }
    return [...groups.values()].map((g) => ({ root: g.find((c) => !c.parentId || !byId.has(c.parentId)) ?? g[0], replies: g.filter((c) => c.parentId && byId.has(c.parentId)) }));
  }, [comments]);

  const startReply = (c) => {
    setReplyTo({ id: c.id, name: c.name || "Someone" });
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const renderComment = (c, isReply) => (
    <li key={c.id} className={`flex gap-2.5 ${isReply ? "rise" : ""}`} style={isReply ? { "--i": 0 } : undefined}>
      <Avatar name={c.name} src={c.avatarUrl} color={c.avatarColor} icon={c.avatarIcon} admin={c.official} size={isReply ? 26 : 30} />
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl rounded-tl-md bg-surface-2 px-3.5 py-2">
          <p className="flex flex-wrap items-center text-xs">
            <b>{c.name || "Someone"}</b>
            {c.official ? <OfficialTick className="ml-1 h-3.5 w-3.5" /> : c.expert && <span className="ml-1.5 text-brand">Expert</span>}
            {c.blueTick && <BlueTick className="ml-1 h-3.5 w-3.5 shrink-0" />}
            {isReply && c.replyToName && (
              <span className="ml-1.5 inline-flex items-center gap-1 text-muted">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4v6a4 4 0 0 0 4 4h12M16 9l5 5-5 5" /></svg>
                <span className="font-medium text-brand">{c.replyToName}</span>
              </span>
            )}
            <span className="ml-1.5 text-muted">{timeAgo(c.createdAt)}</span>
            {p.viewerIsAdmin && (
              <button type="button" onClick={() => setPendingDelete({ type: "comment", id: c.id })} className="ml-auto cursor-pointer font-medium text-muted underline hover:text-danger">Delete</button>
            )}
          </p>
          <p className="mt-0.5 whitespace-pre-line break-words text-sm">{c.body}</p>
        </div>
        {signedIn && (
          <button type="button" onClick={() => startReply(c)} className="ml-3 mt-0.5 cursor-pointer text-xs font-medium text-muted hover:text-brand">Reply</button>
        )}
      </div>
    </li>
  );

  // The same post, drawn once for the feed card and once for the pop-up. They share all state.
  const content = (inModal) => {
    const full = inModal || defaultOpen;
    const showComments = inModal || open;
    return (
      <>
        <header className="flex items-start gap-3">
          <Link href={profilePath(p.author)} aria-label={`View ${p.author.name || "this person"}'s profile`} className="shrink-0">
            <Avatar name={p.author.name} src={p.author.avatarUrl} color={p.author.avatarColor} icon={p.author.avatarIcon} admin={p.author.isAdmin} size={44} />
          </Link>
          <div className="min-w-0 flex-1">
            {/* Name and badge stay on one line. Only the name shrinks, so a badge is never pushed out on phones. */}
            <div className="flex min-w-0 items-center gap-1.5">
              <Link href={profilePath(p.author)} className="min-w-0 truncate font-semibold leading-5 hover:text-brand">{p.author.name}</Link>
              {p.author.isAdmin && <OfficialTick className="h-[18px] w-[18px] shrink-0" />}
              {p.author.blueTick && <BlueTick className="h-4 w-4 shrink-0" />}
              {!p.author.isAdmin && !p.author.blueTick && p.author.verified && <VerifiedMark />}
            </div>
            {/* Line 2: "Student · College" (or "Role at Company"), always on one line. */}
            <p className="truncate text-[13px] leading-5 text-muted">{p.author.isAdmin ? "Official Buncho Team" : roleLine(p.author)}</p>
            {/* Line 3: category first, then when it was posted. After 24 hours it shows the date and how many days ago. */}
            <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs leading-5 text-muted">
              {p.topic && <span className="shrink-0 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold leading-4 text-brand">#{TOPICS[p.topic] ?? p.topic}</span>}
              <time dateTime={p.createdAt} className="min-w-0 truncate">{p.topic ? "· " : ""}{postedLabel(p.createdAt)}</time>
            </p>
          </div>
          <div className="-mr-1.5 flex shrink-0 items-center gap-0.5">
            {!p.mine && !p.author.isAdmin && !hideFollow && (
              signedIn ? (
                <button type="button" onClick={follow} className={`shrink-0 cursor-pointer ${p.following ? "btn-outline" : "btn-primary"} !rounded-full !px-3.5 !py-1 !text-[13px]`}>
                  {p.following ? "Following" : "Follow"}
                </button>
              ) : (
                <Link href={signIn} className="btn-primary shrink-0 !rounded-full !px-3.5 !py-1 !text-[13px]">Follow</Link>
              )
            )}
            <PostMenu p={p} signedIn={signedIn} onDelete={() => setPendingDelete({ type: "post" })} />
          </div>
        </header>

        <div className="mt-3">
          <p className={`whitespace-pre-line break-words ${focus ? "text-[17px] leading-8 sm:text-xl sm:leading-9" : "text-[15px] leading-[1.65]"}`}>{long && !full ? preview : p.body}</p>
          {long && !full && (
            <button type="button" onClick={() => setModal(true)} className="mt-1 cursor-pointer text-sm font-semibold text-brand hover:underline">
              Read more
            </button>
          )}
        </div>

        {p.service && (
          <Link href={`/book/${p.service.id}`} className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-brand/20 bg-brand-soft/60 p-3 text-sm transition-colors hover:border-brand">
            <span className="min-w-0">
              <span className="block text-xs text-muted">Want personal feedback?</span>
              <span className="block truncate font-semibold">{p.service.title}</span>
            </span>
            <span className="shrink-0 font-semibold text-brand">{inr(p.service.priceInr)}</span>
          </Link>
        )}

        {/* Like, comment and share on the left, unique views and bookmark on the right. Every button is at least 44px tall. */}
        <footer className="-mx-3 mt-3 flex items-center border-t border-line pt-1.5">
          {renderBtn({ onClick: like, on: p.liked, icon: "heart", label: "Like", count: p.likes, fxKey: fx.like })}
          {inModal ? (
            <span className={`${act} cursor-default text-brand`}><Icon name="chat" /><span>{p.comments}</span><span className="sr-only">Comments</span></span>
          ) : (
            <button type="button" onClick={() => (focus ? setModal(true) : setOpen(!open))} aria-expanded={open} className={`${act} ${open ? "text-brand" : "text-muted"}`}>
              <Icon name="chat" /><span>{p.comments}</span><span className="sr-only">Comments</span>
            </button>
          )}
          <button type="button" onClick={share} className={`${act} text-muted`}>
            <Icon name="share" anim={fx.share ? "anim-wiggle" : undefined} key={fx.share} />
            <span className="sr-only">{copied ? "Link copied" : "Share"}</span>
          </button>
          <span className="ml-auto inline-flex items-center gap-1 px-2 text-xs font-medium tabular-nums text-muted" title="Unique views">
            <Icon name="eye" />
            {new Intl.NumberFormat("en-IN", { notation: "compact" }).format(p.views ?? 0)}
            <span className="sr-only">views</span>
          </span>
          {renderBtn({ onClick: save, on: p.saved, icon: "mark", label: "Save", fxKey: fx.save })}
        </footer>

        {error && <p role="alert" className="mt-3 rounded-lg bg-danger-soft p-2.5 text-sm text-danger">{error}</p>}

        {showComments && (
          <div className="expand-in mt-4 space-y-3 border-t border-line pt-4">
            {comments === null ? (
              <p className="text-sm text-muted">Loading…</p>
            ) : comments.length === 0 ? (
              <p className="text-sm text-muted">No comments yet. Start the conversation.</p>
            ) : (
              <ul className="space-y-4">
                {threads.map(({ root, replies }) => (
                  <li key={root.id}>
                    <ul>{renderComment(root, false)}</ul>
                    {replies.length > 0 && (
                      <ul className="ml-[15px] mt-2 space-y-2.5 border-l-2 border-line pl-4">
                        {replies.map((r) => renderComment(r, true))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {signedIn ? (
              <form onSubmit={send} className="space-y-2">
                {replyTo && (
                  <p className="page-in flex items-center gap-1.5 text-xs text-muted">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4v6a4 4 0 0 0 4 4h12M16 9l5 5-5 5" /></svg>
                    Replying to <b className="text-brand">{replyTo.name}</b>
                    <button type="button" onClick={() => setReplyTo(null)} aria-label="Cancel reply" className="ml-1 cursor-pointer rounded p-0.5 hover:text-ink">✕</button>
                  </p>
                )}
                <div className="flex gap-2">
                  <input ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={MAX_COMMENT} placeholder={replyTo ? `Reply to ${replyTo.name}` : "Add a comment"} className="input !rounded-full !px-4" />
                  <button disabled={draft.trim().length < 2} className="btn-primary shrink-0">{replyTo ? "Reply" : "Post"}</button>
                </div>
              </form>
            ) : (
              <p className="text-sm text-muted"><Link href={signIn} className="font-medium text-brand hover:underline">Sign in</Link> to comment.</p>
            )}
          </div>
        )}
      </>
    );
  };

  if (deleted) return null;

  return (
    <>
      {/* Phones: full-width card with no side borders, like a real social feed. Larger screens: rounded card.
          In the full-screen viewer the card never scrolls on its own, so a swipe anywhere moves between posts. */}
      <article ref={cardRef} className={`post-card card ${focus ? "mx-auto w-full max-w-xl !rounded-2xl p-5 shadow-xl" : "-mx-4 !rounded-none !border-x-0 p-4 sm:mx-0 sm:!rounded-2xl sm:!border-x sm:p-5"}`}>{content(false)}</article>
      {modal && <Modal onClose={() => setModal(false)}>{content(true)}</Modal>}
      {pendingDelete && (
        <ConfirmDialog
          title={pendingDelete.type === "post" ? "Delete this post?" : "Delete this reply?"}
          text={pendingDelete.type === "post" ? "This permanently removes the post and all its replies. This can't be undone." : "This permanently removes the reply. This can't be undone."}
          confirmLabel={pendingDelete.type === "post" ? "Delete post" : "Delete reply"}
          busy={busy}
          onConfirm={confirmDelete}
          onCancel={() => !busy && setPendingDelete(null)}
        />
      )}
    </>
  );
}