**Principle:** spend scarce expert time where it matters most (verification and ambiguity), and let models and heuristics do the bulk.

**1. Collect realistic inputs**

- Mine **production or pilot logs**, support tickets, search queries, emails (anonymised).
- If none exist: interview users, write scenarios from documentation, or **generate synthetic queries** from your documents/knowledge base with an LLM using varied personas and difficulty levels; add paraphrases and noise.
- **Cluster and sample** (embedding clustering, stratified by topic and difficulty) so a small set covers the space; deduplicate.

**2. Create candidate answers or criteria cheaply**

- For RAG/QA: the **source passage** is the evidence; an LLM drafts question, answer and the supporting quote.
- Run **multiple strong models** and take agreement as a signal (consensus answers are likely correct; disagreement flags hard items for review).
- Use **verifiable proxies** where possible: code tests, SQL execution results, calculators, database lookups, schema checks.
- Instead of full reference answers, write **rubrics or checklists** ("must mention the 30-day window; must not promise refunds beyond policy"), which are easier to verify and grade.

**3. Verify efficiently with humans**

- **Review, don't write:** experts approve/correct drafts (10x faster than authoring); show evidence side by side; binary accept/reject plus comments.
- Prioritise by **risk and uncertainty:** review items where models disagree, high-impact categories, and a **random audit sample** to estimate label error.
- Use **non-expert annotators** (or internal staff) for subjective quality, and experts only for domain facts; use **active learning** to choose the next items.
- Measure **agreement** on an overlap set to know label reliability.

**4. Use weak supervision where truth is unavailable:** pairwise preferences instead of absolute labels; consistency/metamorphic tests (paraphrase invariance, self-consistency); LLM-judge scores validated against a small human-labelled calibration subset (50 to 100 items).

**5. Iterate:** start with 50 to 100 items, evaluate, inspect failures, expand where the system struggles; fold in user feedback and production errors continuously; version the set.

**Risks to manage:** synthetic bias (queries too clean or too similar to the documents), circularity (the same LLM generating tests and answers, so use different models), hidden label errors, and leakage into prompts. Report uncertainty about label quality.
