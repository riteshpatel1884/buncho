**Why short queries fail**

- Little context, so the vector is **ambiguous** ("python": language or snake?).
- Query/document **length mismatch**: a one-word query is embedded far from the long passages that answer it.
- Acronyms and codes may be rare or out of vocabulary for the model.
- No exact-match fallback in a purely dense system.

**Fixes (roughly cheapest first)**

1. **Hybrid search:** add BM25/keyword matching and fuse with RRF; exact terms and acronyms are handled well.
2. **Use the right model mode:** apply the model's **query prefix/instruction** (asymmetric retrieval) and choose a model trained on short queries.
3. **Query expansion / rewriting:** use an LLM to expand to a fuller query with synonyms and the expected intent, or add known acronym expansions from a glossary.
4. **HyDE:** have an LLM write a hypothetical answer and embed *that* instead of the bare query (adds latency and cost).
5. **Query understanding:** detect short or navigational queries and route to keyword search, a **title/FAQ index**, or autocomplete suggestions.
6. **Improve the documents:** add titles, summaries, and a **"questions this answers"** field per chunk so short queries have something to match.
7. **Rerank** the top 30 to 50 with a cross-encoder to fix ordering.
8. **Ask for clarification** when the query is truly ambiguous, or use session/user context to disambiguate.
9. **Fine-tune** the embedding model on real short-query logs.

```python
def search(q):
    if len(q.split()) <= 2:
        q_exp = llm(f"Expand this search query into a clear question: {q}")
        return hybrid(q_exp, bm25_text=q)       # dense on expansion, keyword on original
    return hybrid(q, bm25_text=q)
```

**Measure** with a gold set that includes short queries as their own slice, so improvements are real.
