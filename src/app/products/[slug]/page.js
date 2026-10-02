import Link from "next/link";
import { notFound } from "next/navigation";
import { Show, SignInButton } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/user";
import { timeAgo } from "@/lib/utils";
import { ensureFreshScores } from "@/lib/score";
import { recordEvent } from "@/lib/events";
import VerifiedBadge from "@/components/VerifiedBadge";
import ScoreCard from "@/components/ScoreCard";
import ShareProduct from "@/components/ShareProduct";
import VoteButton from "@/components/VoteButton";
import SubmitButton from "@/components/SubmitButton";
import ProductLogo from "@/components/ProductLogo";
import { addComment } from "./actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await prisma.product.findFirst({ where: { slug, status: "APPROVED" }, select: { name: true, tagline: true } });
  if (!p) return {};
  const title = `${p.name} on Buncho`;
  return {
    title: `${p.name}: ${p.tagline}`,
    description: p.tagline,
    openGraph: { title, description: p.tagline, type: "website" },
    twitter: { card: "summary_large_image", title, description: p.tagline },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  await ensureFreshScores();
  const product = await prisma.product.findFirst({
    where: { slug, status: "APPROVED" },
    include: {
      category: true,
      user: { select: { name: true, username: true, avatarUrl: true, verified: true } },
      _count: { select: { votes: true } },
      comments: { orderBy: { createdAt: "desc" }, take: 50, include: { user: { select: { name: true } } } },
    },
  });
  if (!product) notFound();

  const [user, related, views, pick, discover] = await Promise.all([
    getDbUser(),
    prisma.product.findMany({
      where: { status: "APPROVED", categoryId: product.categoryId, id: { not: product.id } },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, name: true, slug: true, tagline: true, logoUrl: true },
    }),
    prisma.productEvent.count({ where: { productId: product.id, type: "VIEW" } }),
    prisma.dailyPick.findFirst({ where: { productId: product.id }, select: { id: true } }),
    prisma.product.findMany({
      where: { status: "APPROVED", id: { not: product.id } },
      orderBy: [{ score: "desc" }, { createdAt: "desc" }],
      take: 4,
      select: { id: true, name: true, slug: true, tagline: true, logoUrl: true },
    }),
  ]);
  const voted = user
    ? !!(await prisma.vote.findUnique({ where: { userId_productId: { userId: user.id, productId: product.id } } }))
    : false;

  await recordEvent(product, "VIEW");
  const rank = (await prisma.product.count({ where: { status: "APPROVED", score: { gt: product.score } } })) + 1;

  const founder = product.user.name || product.user.username || "Founder";
  let host = product.websiteUrl;
  try { host = new URL(product.websiteUrl).hostname.replace(/^www\./, ""); } catch {}

  return (
    <article className="space-y-8">
      <Link href="/" className="text-sm font-medium text-muted hover:text-ink">Back to all products</Link>

      <header className="card glow rise relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-8">
        <ProductLogo product={product} size={88} />
        <div className="min-w-0 flex-1">
          <h1 className="flex flex-wrap items-center gap-2 font-display text-2xl font-bold leading-tight sm:text-3xl">
            {product.name}
            {product.verified && <VerifiedBadge className="h-6 w-6" label="Verified product" />}
          </h1>
          <p className="mt-1 text-base text-muted sm:text-lg">{product.tagline}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className="rounded-full bg-mint-soft px-3 py-1 text-mint">{product.category.name}</span>
            {product.pricing && <span className="rounded-full border border-line px-3 py-1 text-muted">{product.pricing}</span>}
            <span className="rounded-full border border-line px-3 py-1 text-muted">🇮🇳 Built in India</span>
            {product.user.verified && <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-muted"><VerifiedBadge className="h-4 w-4" label="Verified founder" /> Verified founder</span>}
          </div>
          <a href={`/go/${product.slug}`} target="_blank" rel="noopener" className="btn-primary group mt-5 max-w-full">
            <span className="truncate">Visit {host}</span>
            <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </a>
        </div>
        <div className="absolute right-4 top-4 sm:static">
          <VoteButton productId={product.id} initialCount={product._count.votes} initialVoted={voted} size="lg" />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          {product.screenshots.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.screenshots.map((s) => (
                <img key={s} src={s} alt={`${product.name} screenshot`} className="h-64 shrink-0 rounded-2xl border border-line bg-surface transition duration-300 hover:scale-[1.02] hover:border-brand/50" />
              ))}
            </div>
          )}

          <section className="card reveal p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold">About {product.name}</h2>
            <p className="mt-3 max-w-2xl whitespace-pre-line leading-relaxed">{product.description}</p>
          </section>

          <section id="share" className="card reveal p-6 sm:p-8">
            <ShareProduct
              name={product.name}
              tagline={product.tagline}
              slug={product.slug}
              upvotes={product._count.votes}
              views={views}
              featured={!!pick}
              base={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}
            />
          </section>

          <section className="card reveal p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold">Comments ({product.comments.length})</h2>

            <Show when="signed-in">
              <form action={addComment} className="mt-4 space-y-3">
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="slug" value={product.slug} />
                <textarea name="body" required maxLength={1000} rows={3} placeholder="Share feedback with the founder" className="input" />
                <SubmitButton className="btn-dark" pendingText="Posting">Post comment</SubmitButton>
              </form>
            </Show>
            <Show when="signed-out">
              <div className="mt-4 rounded-xl bg-surface-2 p-4 text-sm text-muted">
                <SignInButton mode="redirect">
                  <button className="font-semibold text-brand">Sign in</button>
                </SignInButton>{" "}
                to leave a comment.
              </div>
            </Show>

            {product.comments.length === 0 ? (
              <p className="mt-5 text-sm text-muted">No comments yet. Say something useful.</p>
            ) : (
              <ul className="mt-6 space-y-5">
                {product.comments.map((c) => (
                  <li key={c.id} className="flex gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mint-soft text-sm font-bold text-mint">
                      {(c.user.name || "M")[0].toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">
                        {c.user.name || "Member"} <span className="font-normal text-muted">{timeAgo(c.createdAt)}</span>
                      </p>
                      <p className="mt-0.5 whitespace-pre-line text-sm">{c.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {discover.length > 0 && (
            <section className="card reveal p-6 sm:p-8">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-xl font-bold">Discover more on Buncho</h2>
                <Link href="/" className="text-sm font-medium text-brand hover:underline">See all</Link>
              </div>
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {discover.map((d) => (
                  <li key={d.id}>
                    <Link href={`/products/${d.slug}`} className="flex items-center gap-3 rounded-xl border border-line p-3 transition-colors hover:border-brand/50">
                      <ProductLogo product={d} size={40} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{d.name}</span>
                        <span className="block truncate text-xs text-muted">{d.tagline}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1">
          <ScoreCard score={product.score} data={product.scoreData} rank={rank} className="card p-5 sm:col-span-2 lg:col-span-1" />
          <div className="card p-5">
            <h3 className="font-display text-lg font-bold">Founder</h3>
            <div className="mt-3 flex items-center gap-3">
              {product.user.avatarUrl ? (
                <img src={product.user.avatarUrl} alt="" className="h-11 w-11 rounded-full object-cover" />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft font-bold text-brand">{founder[0].toUpperCase()}</span>
              )}
              <p className="font-semibold">{founder}</p>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-display text-lg font-bold">Details</h3>
            <dl className="mt-3 space-y-3 text-sm">
              {[
                ["Website", host],
                ["Category", product.category.name],
                ["Pricing", product.pricing || "Not listed"],
                ["Launched", new Date(product.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-muted">{k}</dt>
                  <dd className="truncate font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {related.length > 0 && (
            <div className="card p-5">
              <h3 className="font-display text-lg font-bold">More in {product.category.name}</h3>
              <ul className="mt-3 space-y-3">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link href={`/products/${r.slug}`} className="flex items-center gap-3">
                      <ProductLogo product={r} size={36} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{r.name}</span>
                        <span className="block truncate text-xs text-muted">{r.tagline}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}