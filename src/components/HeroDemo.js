// Static preview of the answer screen with dictation running. Purely decorative.
export default function HeroDemo() {
  const bars = [0.1, 0.35, 0.2, 0.5, 0.05, 0.4, 0.25, 0.45, 0.15, 0.3];
  return (
    <div className="rounded-2xl border border-line bg-surface shadow-[0_24px_60px_-30px_rgba(58,75,239,0.45)]" aria-hidden="true">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <p className="text-sm text-muted">RAG and Vector Databases</p>
          <p className="mt-0.5 font-display text-lg font-semibold leading-snug">
            How would you reduce hallucinations in a RAG application?
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-medium/12 px-2.5 py-0.5 text-sm font-semibold text-medium">Medium</span>
      </div>

      <div className="px-5 py-4 text-[0.97rem] leading-relaxed">
        <p>
          I&rsquo;d start by finding where it fails. First I&rsquo;d log the retrieved chunks for the bad answers and check
          whether the right evidence was retrieved at all. If it was, the problem is in generation, so I&rsquo;d
          <span className="text-muted"> tighten the prompt to answer only from the context and require citations</span>
          <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-accent" />
        </p>
      </div>

      <div className="flex items-center gap-3 border-t border-line px-5 py-3.5">
        <span className="inline-flex items-center gap-2 rounded-lg bg-hard px-3.5 py-2 text-sm font-semibold text-white">
          <span className="h-2 w-2 rounded-full bg-white" /> Stop dictating
        </span>
        <span className="flex h-6 items-center gap-[3px]">
          {bars.map((d, i) => (
            <span key={i} className="wave-bar block h-5 w-[3px] rounded-full bg-hard" style={{ animationDelay: `${d}s` }} />
          ))}
        </span>
      </div>
    </div>
  );
}
