## Start by diagnosing, not tuning

"Improve chunking and add reranking" may help, but only if retrieval is the cause. Split each bad answer into one of three failure points:

1. **Retrieval failure**: the supporting evidence was never in the retrieved context.
2. **Context failure**: it was retrieved but truncated, buried, duplicated or contradicted by other chunks.
3. **Generation failure**: the evidence was present and the model still produced unsupported claims.

### What to do

- Log, for every request: query, rewritten query, retrieved chunk IDs and scores, final prompt, answer, and model settings.
- Build a small evaluation set (50 to 200 real questions) with the source passage that answers each.
- Measure **retrieval**: recall@k, MRR, hit rate against the known passages.
- Measure **faithfulness**: for each claim in the answer, is it supported by the retrieved context? Use human review first, then an LLM judge that you validate against human labels.

## Fixes, matched to the cause

| Cause | Fixes |
|---|---|
| Retrieval misses | Better chunk size and overlap, structure-aware chunking, hybrid search (BM25 plus embeddings), query rewriting, metadata filters, a stronger embedding model, a reranker |
| Context problems | Fewer, better chunks; dedupe; order by relevance; keep key evidence away from the middle of a long prompt; include titles and sources |
| Generation problems | Instruct the model to answer only from the context; require citations; allow "I don't know" when evidence is insufficient; lower temperature; add a verification pass that checks each claim against the sources |
| Knowledge gaps | Detect low-similarity retrievals and abstain or escalate instead of answering |

## Trade-offs

Rerankers and verification passes add latency and cost. Stricter abstention reduces hallucinations but increases refusals, so track both **faithfulness** and **answer rate**.

## Close the loop

Add failing cases to the evaluation set, run it on every change, and monitor faithfulness and user feedback in production.
