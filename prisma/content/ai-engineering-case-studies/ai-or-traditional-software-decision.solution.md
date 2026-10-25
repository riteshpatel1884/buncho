**Principle:** use the simplest tool that reliably solves the problem. AI is for problems where rules are impossible or too brittle, not a default.

**Decision questions**

1. **Can the logic be specified?** If the rules are known and stable (tax calculation, validation, routing by field), write **deterministic code**: cheaper, testable, explainable, 100% reproducible.
2. **Is the input unstructured or variable?** Free text, images, audio, messy documents, natural-language queries favour AI.
3. **Is the output tolerant to errors?** Suggestions, drafts, summaries, search ranking tolerate mistakes with human review; payments, medication doses, legal filings do not.
4. **Is there a clear way to evaluate?** If you cannot define "correct" and build a test set, you cannot manage an AI feature.
5. **Cost, latency and scale:** a regex or SQL query costs nothing and runs in microseconds; an LLM call costs money and 1 to 5 s.
6. **Data and maintenance:** do you have data, feedback loops and capacity to monitor drift and quality?
7. **Risk and regulation:** explainability and audit requirements may force rules or interpretable models.

**Quick heuristic**

| Good fit for AI | Better with traditional software |
|---|---|
| Summarise, classify or extract from free text | Arithmetic, validation, CRUD, workflows |
| Semantic search, recommendation | Exact lookups, permissions, business rules |
| Conversational interfaces, code assistance | Anything requiring guaranteed correctness |
| Perception (vision, speech) | Stable, enumerable decision tables |

**Hybrid is usually best:** LLM turns messy input into structured data, **code validates and executes**. Example: an LLM extracts invoice fields, then deterministic rules check totals and route approvals.

**Process:** prototype with the simplest baseline (rules, keyword search), measure where it fails, and add AI only for the failing slice; compare benefit vs cost vs risk before committing.
