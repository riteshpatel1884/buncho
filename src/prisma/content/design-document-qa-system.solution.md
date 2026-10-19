## 1. Clarify requirements

- **Users and scale**: queries per second, peak load, languages.
- **Latency**: for example, first token under 2 seconds.
- **Freshness**: how soon should an edited document be searchable?
- **Permissions**: who may see which document? Leaking restricted content is the worst failure.
- **Quality**: answers must be grounded and cited, and the system should be allowed to say "I don't know".

## 2. Architecture

**Ingestion (offline and incremental)**: connectors for each source, then parsing and cleaning (PDF/OCR, tables), chunking, embedding, and indexing. Store the document ID, source URL, timestamps and **access control metadata** with every chunk.

**Query path**: authenticate the user, rewrite the query if needed, run **hybrid retrieval** (BM25 plus vector search) with permission filters, rerank the top candidates, build the prompt with citations, generate, and optionally verify that claims are supported.

## 3. Size estimate

Assume 10M documents at about 10 chunks each, which is 100M chunks. With 1024-dimensional float32 embeddings:

$$
100\text{M} \times 1024 \times 4\ \text{bytes} \approx 410\ \text{GB}
$$

before index overhead. Quantisation (for example int8 or product quantisation) can cut this several-fold, and approximate nearest-neighbour indexes (HNSW, IVF) keep latency low. This number drives the choice between one large node and a sharded cluster.

## 4. Permissions

- Enforce access control **at retrieval time** using metadata filters on the user's groups, not by asking the LLM to hide things.
- Sync permission changes from the source systems promptly. Stale ACLs are a security risk.
- Never put a document in the prompt that the user could not open directly.

## 5. Freshness

Use change-data-capture or webhooks to re-embed only changed documents, handle deletes (and delete their chunks), and version the embedding model so you can re-index when it changes.

## 6. Evaluation and monitoring

- Offline: a labelled question set with gold passages, measuring recall@k, MRR, faithfulness and answer correctness.
- Online: thumbs up/down, citation click-through, abstention rate, latency percentiles, cost per query.
- Review failures regularly and feed them back into the evaluation set.

## 7. Trade-offs

| Decision | Benefit | Cost |
|---|---|---|
| Reranking | Higher precision | Added latency and cost |
| Bigger chunks | More context | Noisier retrieval |
| Hybrid search | Handles exact terms and semantics | More infrastructure |
| Strict abstention | Fewer hallucinations | More "I don't know" answers |

## 8. Failure modes to mention

Permission leaks, stale or deleted content still being returned, tables and scanned PDFs parsed badly, near-duplicate documents crowding out results, and prompt injection from document text (treat retrieved text as untrusted data).
