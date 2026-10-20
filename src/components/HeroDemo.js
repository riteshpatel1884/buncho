// Static preview of the problem workspace with dictation running. Purely decorative.
export default function HeroDemo() {
  const bars = [0.1, 0.35, 0.2, 0.5, 0.05, 0.4, 0.25, 0.45, 0.15, 0.3];
  return (
    <div className="panel overflow-hidden shadow-xl shadow-black/10" aria-hidden="true">
      <div className="flex h-9 items-center gap-2 border-b border-line bg-surface-2 px-3 text-xs">
        <span className="h-2.5 w-2.5 rounded-full bg-hard" />
        <span className="h-2.5 w-2.5 rounded-full bg-medium" />
        <span className="h-2.5 w-2.5 rounded-full bg-easy" />
        <span className="ml-3 text-muted">buncho / problems / reduce-rag-hallucinations</span>
      </div>

      <div className="grid sm:grid-cols-2">
        <div className="p-4">
          <div className="flex gap-4 border-b border-line pb-2 text-xs font-medium">
            <span className="border-b-2 border-ink pb-2 text-ink">Description</span>
            <span className="pb-2 text-muted">Solution</span>
            <span className="pb-2 text-muted">Community</span>
          </div>
          <p className="mt-4 text-base font-semibold leading-snug">How would you reduce hallucinations in a RAG application?</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-medium/12 px-2.5 py-0.5 font-semibold text-medium">Medium</span>
            <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-muted">RAG and Vector Databases</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Your support bot answers confidently, but sometimes with facts that are not in your documents. Walk through how you would find the cause and fix it.
          </p>
        </div>

        <div className="border-t border-line sm:border-l sm:border-t-0">
          <div className="flex h-9 items-center gap-2 border-b border-line bg-surface-2 px-4 text-xs font-medium">
            <span className="text-go">&lt;/&gt;</span> Answer
          </div>
          <div className="p-4 font-mono text-[0.8rem] leading-relaxed">
            I&rsquo;d start by finding where it fails. First I&rsquo;d log the retrieved chunks for the bad answers and check whether the right evidence was retrieved at all.
            <span className="text-muted"> If it was, the problem is in generation, so I&rsquo;d tighten the prompt to answer only from the context</span>
            <span className="ml-0.5 inline-block h-3.5 w-0.5 translate-y-0.5 bg-accent" />
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
            <span className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-md bg-hard px-3 py-1.5 text-xs font-semibold text-white">
                <span className="h-2 w-2 rounded-full bg-white" /> Stop dictating
              </span>
              <span className="flex h-5 items-center gap-[3px]">
                {bars.map((d, i) => (
                  <span key={i} className="wave-bar block h-4 w-[3px] rounded-full bg-hard" style={{ animationDelay: `${d}s` }} />
                ))}
              </span>
            </span>
            <span className="rounded-md bg-go px-4 py-1.5 text-xs font-semibold text-go-ink">Submit</span>
          </div>
        </div>
      </div>
    </div>
  );
}