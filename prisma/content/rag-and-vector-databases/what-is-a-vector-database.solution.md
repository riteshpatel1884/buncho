**A vector database** stores high-dimensional **embeddings** with an id, optional **metadata** and often the original text, and is built for fast **nearest-neighbour search**: "find the k vectors most similar to this one".

| | Traditional (SQL/NoSQL) | Vector database |
|---|---|---|
| Core query | Exact match, range, joins, aggregates | **Similarity** (top-k nearest) |
| Index | B-tree, hash, inverted index | **ANN index** (HNSW, IVF, PQ) |
| Results | Exact and deterministic | Usually **approximate** (recall < 100%) |
| Data | Structured fields | Embeddings of text, images, audio |
| Strength | Transactions, integrity, reporting | Semantic search, RAG, recommendations |

**What it does**

1. **Ingest:** store vectors + metadata, build or update the index.
2. **Query:** embed the query with the same model, run ANN search, optionally **filter by metadata**.
3. **Return** ranked ids, scores and payloads.

**Typical features:** several indexes and distance metrics, metadata filtering, hybrid (keyword + vector) search, sharding and replication, quantisation, upserts and deletes.

**Options:** dedicated (Pinecone, Qdrant, Weaviate, Milvus), or extensions to existing stores (pgvector, Elasticsearch/OpenSearch, MongoDB Atlas), or libraries (FAISS).

**When you do not need one:** a few thousand vectors fit in NumPy or FAISS in memory; use a dedicated service when you need persistence, filtering, scale, concurrent updates or high availability. It complements, not replaces, your transactional database.
