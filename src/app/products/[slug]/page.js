import { notFound } from "next/navigation";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/user";
import { timeAgo } from "@/lib/utils";
import VoteButton from "@/components/VoteButton";
import { addComment } from "./actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await prisma.product.findFirst({ where: { slug, status: "APPROVED" }, select: { name: true, tagline: true } });
  return p ? { title: `${p.name}: ${p.tagline}` } : {};
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, status: "APPROVED" },
    include: {
      category: true,
      user: { select: { name: true, username: true } },
      _count: { select: { votes: true } },
      comments: { orderBy: { createdAt: "desc" }, take: 50, include: { user: { select: { name: true } } } },
    },
  });
  if (!product) notFound();

  const user = await getDbUser();
  const voted = user
    ? !!(await prisma.vote.findUnique({ where: { userId_productId: { userId: user.id, productId: product.id } } }))
    : false;

  await prisma.productEvent.create({ data: { type: "VIEW", productId: product.id } });

  return (
    <article className="space-y-8">
      <header className="flex items-start gap-5">
        {product.logoUrl ? (
          <img src={product.logoUrl} alt="" className="h-20 w-20 rounded-xl object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-line font-display text-3xl font-bold">
            {product.name[0]}
          </div>
        )}
        <div className="flex-1">
          <h1 className="font-display text-3xl font-bold">{product.name}</h1>
          <p className="text-muted">{product.tagline}</p>
          <p className="mt-1 text-sm text-muted">
            🇮🇳 Built in India by {product.user.name || product.user.username || "a founder"} • {product.category.name}
            {product.pricing ? ` • ${product.pricing}` : ""}
          </p>
          <a
            href={`/go/${product.slug}`}
            target="_blank"
            rel="noopener"
            className="mt-3 inline-block rounded-md bg-accent px-4 py-2 font-medium text-white"
          >
            Visit website
          </a>
        </div>
        <VoteButton productId={product.id} initialCount={product._count.votes} initialVoted={voted} />
      </header>

      {product.screenshots.length > 0 && (
        <div className="flex gap-3 overflow-x-auto">
          {product.screenshots.map((s) => (
            <img key={s} src={s} alt={`${product.name} screenshot`} className="h-56 rounded-lg border border-line" />
          ))}
        </div>
      )}

      <section>
        <h2 className="font-display text-xl font-semibold">About</h2>
        <p className="mt-2 max-w-2xl whitespace-pre-line">{product.description}</p>
      </section>

      <section className="max-w-2xl">
        <h2 className="font-display text-xl font-semibold">Comments ({product.comments.length})</h2>
        <SignedIn>
          <form action={addComment} className="mt-3 space-y-2">
            <input type="hidden" name="productId" value={product.id} />
            <input type="hidden" name="slug" value={product.slug} />
            <textarea name="body" required maxLength={1000} rows={3} placeholder="Share feedback with the founder"
              className="w-full rounded-md border border-line bg-white p-2" />
            <button className="rounded-md bg-ink px-4 py-2 text-white">Post comment</button>
          </form>
        </SignedIn>
        <SignedOut>
          <p className="mt-3 text-sm text-muted">
            <SignInButton mode="redirect"><button className="font-medium text-accent">Sign in</button></SignInButton> to comment.
          </p>
        </SignedOut>
        <ul className="mt-4 space-y-3">
          {product.comments.map((c) => (
            <li key={c.id} className="rounded-lg border border-line bg-white p-3 text-sm">
              <p className="font-medium">{c.user.name || "Member"} <span className="font-normal text-muted">{timeAgo(c.createdAt)}</span></p>
              <p className="mt-1 whitespace-pre-line">{c.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
