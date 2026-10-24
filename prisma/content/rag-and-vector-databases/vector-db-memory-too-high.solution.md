**1. Measure first**

- Raw vectors = $N\times d\times 4$ bytes (float32). Example: 10M vectors x 768 dims = about 30.7 GB.
- Add **index overhead** (HNSW links, IVF lists), **payload/metadata**, replicas and caches.
- Find out whether the cost is vectors, graph, payload or duplicate data.

**2. Reduce data**

- **Deduplicate** chunks and remove stale versions or deleted documents (tombstones that were never compacted).
- Reduce **chunk overlap** and avoid indexing boilerplate (headers, footers, navigation).
- Store full text and large payloads **outside** the vector index (object store or database) and keep only ids.

**3. Compress vectors**

- **Scalar int8:** about 4x smaller, small recall loss.
- **PQ / binary:** up to ~32x, with **oversample + re-score** using full vectors from disk.
- **Matryoshka truncation or a smaller model** (e.g. 1024 to 384 dims).

**4. Change the index or storage tier**

- Use **memory-mapped / on-disk indexes** (DiskANN-style, IVF on disk) keeping only compressed vectors or the graph in RAM.
- Tune HNSW: lower `M` shrinks the graph (at some recall cost).
- **Tier data:** hot recent data in RAM, cold data on disk, or partition by tenant and load on demand.

**5. Validate**

Re-run recall@k and answer-quality evaluation against the old setup; set an acceptable regression budget (e.g. less than 1 point of recall@10) and monitor latency (disk reads add p95 latency).

**Order of effort:** dedupe and payload offload (free), then int8 and dimension reduction (cheap), then PQ/disk indexes (more engineering).
