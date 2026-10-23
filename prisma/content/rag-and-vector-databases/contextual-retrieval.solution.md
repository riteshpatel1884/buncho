**Problem:** after chunking, a passage often loses the context that makes it findable. "Revenue grew 3% over the previous quarter" does not say which company or period, so neither embeddings nor BM25 can match it to "ACME Q2 2023 revenue growth".

**Idea (Anthropic, 2024):** before indexing, have an LLM write a **short, chunk-specific context** (about 50 to 100 tokens) using the whole document, and **prepend it to the chunk**. Then embed and BM25-index the contextualised chunk.

```python
PROMPT = """<document>{doc}</document>
Here is a chunk from that document:
<chunk>{chunk}</chunk>
Write a short context that situates this chunk within the document to improve search retrieval. Answer with the context only."""

for chunk in chunks:
    ctx = llm(PROMPT.format(doc=doc, chunk=chunk.text))
    chunk.text_for_index = f"{ctx}\n{chunk.text}"
```

Example result: "This chunk is from ACME's Q2 2023 10-Q filing; the previous quarter's revenue was $314M. Revenue grew 3% over the previous quarter."

**Results reported:** about 35% fewer failed retrievals with contextual embeddings, 49% with contextual embeddings plus contextual BM25, and about 67% when also reranking (top-20 failure rate on the benchmarks used).

**Cost control:** the full document is repeated in every call, so use **prompt caching** for the document prefix; cost is a one-time ingestion cost (re-run when a document changes).

**Trade-offs:** ingestion cost and time; added text may bias matches if the context is wrong (validate samples); long documents must fit the LLM context or be processed by section. Works best combined with hybrid search and reranking.
