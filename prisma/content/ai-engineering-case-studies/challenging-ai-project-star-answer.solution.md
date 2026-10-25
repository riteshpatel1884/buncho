**Structure (about 2 to 3 minutes): Situation → Task → Approach → Trade-offs → Result → Learning**

1. **Context and problem** (20 s): who the users were, what was broken, why it mattered, and the constraints (data, latency, budget, team).
2. **Your role:** what **you** decided and built (say "I", credit the team).
3. **Approach:** baseline first, then iterations; how you evaluated (eval set, metrics).
4. **Trade-offs:** 2 or 3 real decisions with alternatives and why you chose one (accuracy vs latency, RAG vs fine-tuning, build vs buy, scope).
5. **Outcome:** numbers (accuracy, cost, adoption, time saved) and what you would do differently.

**Illustrative example (replace with your own facts; this is a template, not a claim about your history)**

*Problem:* "Our document Q&A assistant answered about 70% of questions correctly on an internal test set, and users distrusted it because wrong answers sounded confident."

*Approach:* "I built a 300-question eval set from real queries, then diagnosed failures: about half were retrieval misses (tables in PDFs, jargon), a quarter were hallucinations. I improved parsing (layout-aware chunking), added hybrid search with a reranker, and required citations with an abstain path when retrieval confidence was low."

*Trade-offs:* "The reranker added about 150 ms and cost; I measured that it lifted context recall from 71% to 88% and kept it for the full pipeline but skipped it for simple queries via routing. I chose RAG over fine-tuning because documents changed weekly."

*Outcome:* "Answer accuracy went from 70% to 89%, citation coverage 95%, hallucination rate on the eval set fell from 12% to 4%; p95 latency stayed under 3 s; support tickets about wrong answers dropped by about a third in the pilot."

*Learning:* "Building the eval set first made every later decision faster; next time I would add production feedback sooner."

**Tips:** pick a project where you owned decisions; quantify; show how you handled failure or ambiguity; be ready for follow-ups ("why not X?", "what would you change?"); never claim others' work.
