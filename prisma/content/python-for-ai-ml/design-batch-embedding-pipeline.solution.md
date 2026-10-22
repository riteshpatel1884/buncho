**Estimates.** 50M x 400 tokens = 20B tokens. At, say, 1M tokens/min per API key that is 20,000 minutes (about two weeks) on one key, so you need parallelism, a faster model, or self-hosted GPUs. Daily delta: 1M documents = 400M tokens, which is routine. Vectors: 50M x 768 x 4 bytes is about 150 GB (float32), so plan quantisation or sharding.

**Architecture**
1. **Source and manifest.** Read documents from object storage/DB in **shards** (for example 50k docs each), recorded in a manifest table with status `pending / running / done / failed`, a content hash and the embedding model version.
2. **Workers.** A job runner (Ray, Celery, Spark, or Kubernetes jobs) leases shards. Inside a worker: stream docs (generators), chunk text, **dedupe by content hash**, batch by tokens, call the embedder, write output shard files (Parquet with ids, vectors, metadata) and only then mark the shard done.
3. **Concurrency in Python.** API embedding: `asyncio` + semaphore + rate limiter. Self-hosted GPU model: one process per GPU, large batches, sort by length to reduce padding, CPU tokenisation in a worker pool (processes), prefetching.
4. **Index load.** Bulk-load Parquet shards into the vector database with upsert by `doc_id + chunk_id`; build or refresh the ANN index after loading; use a new index version and **swap an alias** for zero-downtime releases.
5. **Incremental updates.** Change feed or nightly diff by content hash; re-embed only changed chunks; delete tombstoned documents; full re-embed only when the model version changes (store `model_version` with every vector, since vectors from different models are incompatible).

**Reliability**
- **Idempotent** shards: output path is derived from the shard id, so retries overwrite rather than duplicate. Retries with backoff for 429/5xx; poison-document quarantine (too long, bad encoding) in a dead-letter table instead of failing the shard.
- Checkpointing through the manifest means a crash resumes from unfinished shards.

**Cost and quality**
- Cache by content hash (many near-duplicates), drop boilerplate, choose embedding dimension and model by measured recall, not guesswork.
- Validate: vector count equals chunk count, no NaN/zero vectors, norm and dimension checks, spot-check nearest neighbours, and evaluate **recall@k on a labelled query set** before promoting a new index.

**Monitoring.** Throughput (tokens/s), queue depth, error rate by class, cost per million tokens, freshness lag (time from document change to searchable), and index size. Alert on stalled shards.

**Trade-offs.** Managed API: simple, rate-limited, pay per token. Self-hosted GPUs: cheaper at this volume, more operations work. Smaller or truncated-dimension embeddings cut storage and latency but may reduce recall.
