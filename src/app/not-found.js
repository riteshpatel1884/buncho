import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <p className="font-display text-6xl font-bold text-brand">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold">We couldn't find that page</h1>
      <p className="mt-2 text-muted">The profile may be under review, or the link may be old.</p>
      <Link href="/experts" className="btn-primary mt-6">Find an expert</Link>
    </div>
  );
}
