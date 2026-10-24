| | **Flat** | **IVF** | **HNSW** |
|---|---|---|---|
| How | Compare against every vector | k-means clusters; search `nprobe` closest | Multi-layer graph; greedy search |
| Recall | **100% (exact)** | Tunable (`nprobe`) | Very high (`efSearch`) |
| Latency | Grows linearly with N | Low | Lowest at high recall |
| Memory | Raw vectors only | Raw + centroids (small), or compressed with PQ | Raw + **graph links** (extra memory) |
| Build | None | Needs a **training/clustering** step | Slow-ish build, incremental inserts fine |
| Updates | Trivial | Fine, but clusters drift over time | Good for inserts; deletes are awkward |
| Parameters | none | `nlist`, `nprobe` | `M`, `efConstruction`, `efSearch` |

**Recall vs latency:** raising `nprobe` (IVF) or `efSearch` (HNSW) examines more candidates: recall goes up, **latency goes up**, with **diminishing returns** (going from 95% to 99% recall can cost several times the latency of 90% to 95%). Pick the lowest setting that meets your quality target, measured with recall@k against flat search.

```python
import faiss
flat = faiss.IndexFlatIP(d)                              # exact
ivf  = faiss.IndexIVFFlat(faiss.IndexFlatIP(d), d, 1024) # train, then ivf.nprobe = 16
hnsw = faiss.IndexHNSWFlat(d, 32)                        # M = 32, then hnsw.hnsw.efSearch = 64
```

**Decision guide**

- **Under ~100k vectors or you need exact results:** Flat (simple, fast enough, perfect recall).
- **Millions of vectors, latency-critical, RAM available:** **HNSW**.
- **Very large or memory-bound:** **IVF-PQ** (or HNSW over compressed vectors) with re-scoring.
- **Heavy filtering:** check how the engine combines filters with the index; heavy filters can break graph traversal and hurt recall.
- **Frequent deletes/rewrites:** plan periodic rebuilds.

Benchmark on **your** embeddings and queries.
