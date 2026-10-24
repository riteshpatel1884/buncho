**Requirements:** natural-language queries ("red car at sunset"), image-as-query, video moment search, filters (date, owner, license), millions to billions of items, sub-second latency.

**Indexing pipeline**

```text
Ingest (object store) -> Content processing
   images: resize -> multimodal embedding (CLIP/SigLIP-style) -> vector
   video: scene/shot detection -> keyframes (+ clip-level embedding) -> vectors with timestamps;
          ASR transcript + OCR + captions -> text index
   Metadata extraction (EXIF, objects, faces if permitted, tags)
-> Vector index (ANN, sharded) + keyword index + metadata store
```

**Query pipeline**

1. Encode the query with the **same multimodal model** (text tower or image tower) into the shared space.
2. **ANN retrieval** (HNSW/IVF-PQ) with metadata **pre-filters**; plus **BM25** over captions/transcripts/OCR.
3. **Fuse** (RRF) and **rerank** top candidates with a stronger cross-modal or VLM reranker.
4. Return thumbnails/timestamps; for videos map the hit to the exact segment.

**Design decisions**

- One shared embedding space allows cross-modal search; add **per-modality text signals** (captions, transcripts) for precision on named entities and exact words, which pure embeddings handle poorly.
- **Video:** index at shot/segment level, not whole files; store start/end times; avoid indexing every frame (adaptive sampling).
- **Scale:** shard by tenant or hash, compress vectors (PQ/int8), tiered storage, batch GPU embedding with a queue.
- **Freshness:** streaming ingestion with incremental index updates.
- **Safety and rights:** NSFW filtering, face/biometric rules, access control per asset, copyright/licence filters.

**Evaluation:** recall@k and nDCG on labelled query-result sets, per modality; latency percentiles; human relevance judgments; query log analysis for zero-result and low-click queries.

**Trade-offs:** embedding model size vs cost, frame sampling density vs index size, reranker cost vs quality.
