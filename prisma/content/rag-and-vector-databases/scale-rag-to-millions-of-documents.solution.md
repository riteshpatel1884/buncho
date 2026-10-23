**Memory estimate:** 100M vectors x 768 dims x 4 bytes (float32) = about **307 GB**. Plus the graph or index overhead, and the raw text/metadata. Brute-force search over this is far too slow, so you need **approximate nearest neighbour (ANN)** search and compression.

**ANN index types**

| Index | Idea | Trade-off |
|---|---|---|
| **HNSW** | Multi-layer proximity graph | Excellent recall/speed; high memory |
| **IVF** | Cluster vectors; search only the nearest `nprobe` clusters | Lower memory; tune `nprobe` for recall |
| **PQ / OPQ** | Compress vectors into short codes (e.g. 64 bytes: 100M vectors = 6.4 GB) | Smaller, some recall loss |
| **IVF-PQ, DiskANN** | Compressed + disk-based graph | Billion-scale on modest RAM |

**Scaling levers**

- **Quantisation:** int8 or binary vectors (4x to 32x smaller); rescore the top candidates with full-precision vectors.
- **Shorter embeddings:** Matryoshka models truncated to 256 to 512 dims.
- **Sharding and replication:** shard by tenant, date or hash; replicate for throughput; query shards in parallel and merge.
- **Metadata pre-filters / partitions** (per tenant, department) so each query searches a small slice.
- **Two-stage retrieval:** cheap ANN for 200 candidates, then rerank.
- **Hybrid with BM25** for exact matches and to reduce embedding dependence.
- **Caching** of popular queries and embeddings.
- **Ingestion at scale:** batch embedding on GPUs, queue-based workers, incremental updates.
- **Dedupe** near-duplicate chunks to reduce index size.

```python
# FAISS example: IVF + PQ for large collections
import faiss
index = faiss.index_factory(768, "IVF65536,PQ64")
index.train(sample_vectors); index.add(all_vectors)
index.nprobe = 32            # raise for recall, lower for speed
D, I = index.search(query_vectors, 200)
```

**Evaluate** recall of the ANN index against exact search on a sample (target above 95% recall@10), measure p95 latency and cost per query, and re-tune `ef_search`/`nprobe` as data grows.
