import Link from "next/link";
import VoteButton from "./VoteButton";

export default function ProductCard({ product, voted = false }) {
  return (
    <li className="flex items-center gap-4 rounded-xl border border-line bg-white p-4">
      {product.logoUrl ? (
        <img src={product.logoUrl} alt="" className="h-14 w-14 rounded-lg object-cover" />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-line font-display text-xl font-bold">
          {product.name[0]}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <Link href={`/products/${product.slug}`} className="font-display text-lg font-semibold hover:underline">
          {product.name}
        </Link>
        <p className="truncate text-sm text-muted">{product.tagline}</p>
        <p className="mt-1 text-xs text-muted">
          {product.category.name}
          {product.pricing ? ` • ${product.pricing}` : ""}
        </p>
      </div>
      <VoteButton productId={product.id} initialCount={product._count.votes} initialVoted={voted} />
    </li>
  );
}
