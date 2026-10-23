**1. Diagnose first: retrieval failure or generation failure?**

Log for every request: the query (and rewritten query), retrieved chunk ids and scores, the final prompt, the answer, and citations. On 100 bad answers, label each:

| Cause | Check |
|---|---|
| **Retrieval miss** | The right passage is not in the top-k at all |
| **Wrong context ranked high** | Right passage retrieved but buried, or distractors present |
| **Model ignores context** | Right passage present, answer contradicts or goes beyond it |
| **Knowledge gap** | Documents do not contain the answer, yet the model answers |
| **Stale or conflicting docs** | Multiple versions, outdated policy |

**2. Fix retrieval (usually the biggest win)**

- Better chunking (by section, with overlap and titles), metadata filters (department, date, version).
- Hybrid search (BM25 + vectors) and a **reranker**; query rewriting for follow-ups.
- Tune top-k; fewer, more relevant chunks beat many noisy ones.
- Clean and deduplicate sources; remove outdated versions.

**3. Constrain generation**

- Prompt: answer only from the context, say "I don't know" if missing, quote or cite sources.
- Lower temperature; put the context close to the question.
- **Abstain** when retrieval scores are below a threshold.
- Structured output: `{answer, citations[]}` and reject answers with no citation.

**4. Verify after generation**

- Split the answer into claims and check each against the retrieved text (NLI model or LLM judge); remove or regenerate unsupported claims.
- Check that cited quotes really exist in the chunks.

**5. Measure**

- Build a labelled eval set (answerable and unanswerable questions). Track retrieval recall@k, **faithfulness/groundedness**, answer correctness and abstention rate.
- A/B test changes; monitor user thumbs-down and sampled audits in production.

```python
def answer(q):
    hits = rerank(q, retrieve(q, k=30))[:5]
    if not hits or hits[0].score < 0.4:
        return "I could not find this in the policy documents."
    out = llm(prompt(q, hits), temperature=0)
    return out if all(c in hits_text(hits) for c in out.quotes) else fallback(q)
```

**Target:** report hallucination rate on the eval set before and after (for example 12% to under 3%), and keep over-refusal in check.
