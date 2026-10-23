| | Cross-encoder | ColBERT (late interaction) | LLM reranker |
|---|---|---|---|
| Input | `[query; passage]` jointly, one forward pass per pair | Query and doc encoded separately, token embeddings compared with MaxSim | Prompt containing query and passages, LLM outputs a score or ranking |
| Precompute docs | No | Yes (token vectors) | No |
| Quality | High | High (slightly below cross-encoder) | Highest on complex, reasoning-heavy relevance |
| Latency (top-100) | Moderate (batched small model) | Low (vectors precomputed) | High (seconds) |
| Cost | Low to moderate | Storage-heavy, cheap at query time | Highest (tokens) |
| Context size | One passage at a time | Per-doc | Many passages per prompt, limited by context |
| Weaknesses | Scales linearly with candidates | Large index | Cost, variance, position bias, prompt-sensitive |

**LLM rerank styles:** **pointwise** (score each passage), **pairwise** (compare two), **listwise** (rank a window of passages, for example RankGPT; sliding windows for long lists).

```python
def listwise_rerank(llm, query, passages, top=5):
    numbered = "\n".join(f"[{i}] {p[:500]}" for i, p in enumerate(passages))
    out = llm(f"Query: {query}\nRank passages by relevance, most relevant first. "
              f"Return ids as a comma list.\n{numbered}")
    order = [int(x) for x in out.split(",") if x.strip().isdigit()]
    return [passages[i] for i in order[:top]]
```

**Choosing**

- **Default:** a cross-encoder on 50 to 100 candidates.
- **Large corpus with strict latency or token-level matching needs:** ColBERT as retriever or reranker.
- **Hard queries, small candidate set, quality over cost:** an LLM reranker, ideally only for the top 10 to 20 after a cheaper stage.

Always compare on your own queries (nDCG, answer quality) and include latency and cost per request.
