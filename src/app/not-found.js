import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-24">
      <p className="text-sm font-semibold text-brand">404</p>
      <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">This page isn't here.</h1>
      <p className="mt-4 text-muted">The profile may still be under review, or the link may be old. Experts are listed once Buncho has checked them.</p>
      <Link href="/experts" className="btn-primary mt-8">Find an expert</Link>
    </div>
  );
}