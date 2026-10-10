import Link from "next/link";
import { COMPANY } from "@/lib/company";

// A section's `body` is a list of paragraphs (strings) and bullet lists (arrays of strings).
export default function LegalPage({ title, intro, sections }) {
  return (
    <div className="mx-auto max-w-5xl">
      <header className="max-w-2xl">
        <h1 className="font-display text-3xl sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-muted">{COMPANY.brand} · Last updated {COMPANY.updated}</p>
        {intro && <p className="mt-4 text-muted">{intro}</p>}
      </header>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="On this page" className="hidden lg:block">
          <div className="sticky top-24 space-y-1 border-l border-line pl-4 text-sm">
            {sections.map((s, i) => (
              <a key={s.id} href={`#${s.id}`} className="block py-1 text-muted hover:text-brand">{i + 1}. {s.title}</a>
            ))}
          </div>
        </nav>

        <div className="space-y-10">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-28">
              <h2 className="font-display text-xl sm:text-2xl">{i + 1}. {s.title}</h2>
              <div className="mt-3 space-y-3 leading-relaxed">
                {s.body.map((b, j) =>
                  Array.isArray(b) ? (
                    <ul key={j} className="list-disc space-y-1.5 pl-5 marker:text-brand">
                      {b.map((li) => <li key={li}>{li}</li>)}
                    </ul>
                  ) : (
                    <p key={j}>{b}</p>
                  )
                )}
              </div>
            </section>
          ))}

          <p className="border-t border-line pt-6 text-sm text-muted">
            Questions about this page? <Link href="/contact" className="font-medium text-brand hover:underline">Contact {COMPANY.brand}</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}