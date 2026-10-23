**1. Clarify requirements:** latency, freshness, access control, languages, multi-hop questions, citation requirements, and tolerance for "I don't know".

**2. Size estimate**

- 10M documents x about 8 chunks (about 500 tokens each) = **80M chunks**.
- Embedding dimension 1024, float32: 80M x 1024 x 4 B is about **330 GB**. With int8 scalar quantisation about **82 GB**; with product quantisation or binary codes less. An HNSW graph adds roughly 10 to 30%.
- Plus the text store and metadata (hundreds of GB) and a BM25 inverted index.
- Conclusion: a distributed vector index (sharded, replicated) or a managed store; keep vectors compressed in RAM and full-precision vectors on disk for reranking.

**3. Architecture**

```text
Sources -> Connectors -> Parse/clean -> Chunk -> Embed -> Index (vector + BM25 + metadata incl. ACL)
                                        ^ change events / queue / incremental updates

Query -> AuthN -> query rewrite -> hybrid retrieval (filtered by ACL) -> rerank -> context builder
      -> LLM (with citations) -> grounding check -> answer + sources -> feedback log
```

- **Ingestion:** connectors with change detection (webhooks or polling, content hashes), queue-based workers, document-type parsers (OCR for scans, table handling), structure-aware chunking with titles and section paths.
- **Retrieval:** hybrid dense + BM25 for recall, top 50 to 100, **cross-encoder reranker** down to 5 to 10 chunks. Metadata filters (team, date, doc type).
- **Generation:** system prompt that forces grounded answers with inline citations; abstain when evidence is weak. Use a smaller model for easy questions and a stronger one for hard ones (router); stream tokens.

**4. Permissions (critical)**

Store the ACL (user, group ids) with each chunk and **filter inside the vector query** (pre-filter), never after generation. Sync permission changes quickly (permission events trigger metadata updates, not re-embedding). Cache keys must include the user's access scope. Audit-log which documents were used.

**5. Freshness**

Incremental indexing: only changed documents re-chunked and re-embedded (hash check); upsert and tombstone deleted ones. A 15-minute SLA means a streaming queue and near-real-time index refresh; run a periodic full reconciliation to catch missed events.

**6. Latency and cost budget (p95 5 s)**

Query rewrite 0.3 s, retrieval 0.2 s, rerank 0.4 s, LLM first token 1 s plus streaming. Cost levers: cache embeddings and frequent answers, prompt caching for the system prompt, limit context to the reranked chunks, route simple questions to small models, quantised vectors.

**7. Evaluation and monitoring**

- Golden set of 300+ real questions with expected documents and answers; measure recall@k, MRR, answer correctness, **faithfulness**, citation accuracy, abstention quality.
- Online: thumbs up/down, "no answer" rate, latency percentiles, retrieval score distribution, cost per query, index lag.
- Regression-test every change to chunking, embedding model or prompt on the golden set.

**8. Risks and trade-offs:** stale or conflicting documents, prompt injection from document content (treat retrieved text as data, sanitise, restrict tools), sensitive-data leakage (ACL bugs), embedding-model migration (needs full re-index; version the index), and multi-hop questions (consider query decomposition or agentic retrieval later).
