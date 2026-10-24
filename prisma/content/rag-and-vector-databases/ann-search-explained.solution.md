**Problem:** exact (brute-force) search compares the query with all $N$ vectors: $O(N\cdot d)$ per query. At $N=10^9$, $d=768$ that is about $7.7\times10^{11}$ multiply-adds per query. ANN trades a little **recall** for orders of magnitude less work.

**Main families**

| Approach | Idea | Trade-off |
|---|---|---|
| **Graph (HNSW)** | Greedy walk through a layered proximity graph | Best recall/latency; high memory |
| **Partition (IVF)** | Cluster vectors, search only the `nprobe` nearest clusters | Smaller, tunable; recall depends on `nprobe` |
| **Compression (PQ, scalar, binary)** | Store small codes, compare approximately | Large memory cut; some recall loss |
| **Hashing (LSH)** | Hash similar vectors into the same buckets | Simple; usually lower quality than graphs |

Real systems combine them, e.g. **IVF + PQ** or **HNSW on quantised vectors**, then **re-score** the top candidates with the full vectors.

**Key metric: recall@k** = fraction of the true top-k that ANN returns, measured against an exact search on a sample. Tune parameters (`ef_search`, `nprobe`) until recall meets your target (e.g. 95%+) at acceptable latency.

**Handling billions of vectors**

1. **Memory maths:** $10^9\times768\times4$ bytes $\approx$ 3 TB of raw float32. Compress (PQ, int8, binary) and/or use shortened Matryoshka vectors.
2. **Shard** across nodes (by hash or tenant); query shards in parallel and merge top-k.
3. **Disk-based indexes** (DiskANN-style) keep compressed vectors in RAM and full vectors on SSD.
4. **Two-stage:** cheap coarse search, then re-score and rerank a few hundred candidates.
5. **Filter-aware design:** partitions per tenant/category so filters do not scan everything.
6. **Replicate** for throughput and availability; plan rebuild and update strategy (batch rebuild vs incremental inserts).

**Always measure** recall, p95 latency, memory and cost on your own data; defaults rarely fit.
