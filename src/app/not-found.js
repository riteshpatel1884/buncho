import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-24">
      <h1 className="font-display text-5xl leading-[1.05] sm:text-6xl">This page isn't here.</h1>
      <p className="mt-4 text-muted">The profile may still be under review, or the link may be old. Experts are listed once Buncho has checked them.</p>
      <Link href="/experts" className="btn-primary mt-8">Find an expert</Link>
    </div>
  );
}