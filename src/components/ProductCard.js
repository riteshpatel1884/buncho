import Link from "next/link";
import VoteButton from "./VoteButton";
import ProductLogo from "./ProductLogo";

export default function ProductCard({ product, rank, voted = false, index = 0 }) {
  const comments = product._count.comments ?? 0;
  return (
    <li
      className="card card-hover glow rise relative flex items-center gap-4 p-4"
      style={{ "--i": Math.min(index, 8) }}
    >
      {rank && (
        <span
          className={`hidden w-7 shrink-0 text-center font-display text-xl font-bold sm:block ${
            rank <= 3 ? "text-brand" : "text-muted/60"
          }`}
        >
          {rank}
        </span>
      )}
      <ProductLogo product={product} size={56} />
      <div className="min-w-0 flex-1">
        <Link
          href={`/products/${product.slug}`}
          className="font-display text-lg font-semibold leading-tight after:absolute after:inset-0"
        >
          {product.name}
        </Link>
        <p className="truncate text-sm text-muted">{product.tagline}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-mint-soft px-2.5 py-0.5 font-medium text-mint">{product.category.name}</span>
          {product.pricing && <span className="rounded-full border border-line px-2.5 py-0.5 text-muted">{product.pricing}</span>}
          <span className="text-muted">{comments} {comments === 1 ? "comment" : "comments"}</span>
        </div>
      </div>
      <div className="relative z-10">
        <VoteButton productId={product.id} initialCount={product._count.votes} initialVoted={voted} />
      </div>
    </li>
  );
}