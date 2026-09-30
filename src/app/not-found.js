import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <p className="font-display text-6xl font-bold text-brand">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold">We couldn't find that page</h1>
      <p className="mt-2 text-muted">The product may have been removed, or it is still waiting for review.</p>
      <Link href="/" className="btn-primary mt-6">Back to discover</Link>
    </div>
  );
}
