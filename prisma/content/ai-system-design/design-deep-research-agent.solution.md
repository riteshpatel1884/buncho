**Requirements:** long-running (minutes to hours), breadth + depth, **verifiable citations**, bounded cost, resumable, and transparent progress.

**Architecture (planner / workers / writer)**

```text
User question -> clarify scope -> Planner (research plan: sub-questions)
   -> parallel Research subagents (each: search -> read -> extract notes + sources)
   -> Shared notes store (claims, quotes, URLs, confidence)
   -> Gap analysis / critic (what is missing, conflicting?) -> more research rounds
   -> Writer (outline -> sections grounded in notes) -> Verifier (check claims vs sources) -> Report
```

**Key components**

- **Tools:** web search, page fetch/reader (clean text extraction), PDF parser, code interpreter for data, private-document retrieval.
- **Subagents with separate context windows** so each can read many pages; only distilled notes return to the lead (context engineering).
- **Notes store with provenance:** every claim keeps quote + URL + retrieval time.
- **Source evaluation:** prefer primary/authoritative sources, de-duplicate, flag conflicts and date-sensitive facts.
- **Iteration:** loop until coverage criteria are met or a **budget** (steps, tokens, time) is hit.
- **Durable execution:** checkpoint state in a queue/workflow engine so long jobs survive failures; stream progress to the UI.

**Quality controls:** claim-level citation checking (is each statement supported by the cited text?), contradiction handling, "unknown / not found" reporting, avoiding hallucinated URLs (cite only fetched pages).

**Safety:** prompt injection in web pages (treat as data, restrict tools), SSRF and domain allow/deny lists, robots/terms compliance, rate limiting.

**Cost control:** model tiering (cheap model for reading and extraction, strong model for planning and writing), caching fetched pages, parallelism caps, early stopping.

**Evaluation:** rubric-graded reports (coverage, accuracy, citation precision/recall), human preference, cost per report, time to completion.
