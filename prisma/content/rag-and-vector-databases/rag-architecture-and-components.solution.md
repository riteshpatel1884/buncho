**Two paths**

```text
OFFLINE (indexing)                              ONLINE (query)
documents -> parse/clean -> chunk               user question
          -> embed -> vector index (+ metadata)   -> (rewrite) -> embed
                                                  -> retrieve top-k (+ filters)
                                                  -> (rerank) -> build prompt
                                                  -> LLM -> answer + citations
```

| Component | Job | Typical failure |
|---|---|---|
| **Ingestion / parsing** | Load PDFs, HTML, DB rows; extract text and structure | Broken tables, lost headings, OCR errors |
| **Chunking** | Split into retrievable units with overlap and metadata | Chunks too big or too small, split mid-idea |
| **Embedding model** | Convert chunks and queries to vectors | Poor domain fit, language mismatch |
| **Vector store / index** | Store vectors, ANN search, metadata filters | Slow or low-recall search, stale data |
| **Retriever** | Top-k search (dense, sparse or hybrid) | Misses the relevant chunk |
| **Reranker (optional)** | Reorder candidates with a stronger model | Latency, wrong ordering |
| **Prompt builder** | Assemble instructions, context, history | Too much context, no citation format |
| **LLM** | Generate a grounded answer | Ignores context, hallucinates |
| **Post-processing / guardrails** | Citations, grounding checks, formatting | Unsupported claims slip through |
| **Evaluation and monitoring** | Offline metrics, user feedback, logs | No visibility, silent regressions |

**Principle:** debug and measure retrieval and generation separately. Most RAG problems are retrieval or ingestion problems, not LLM problems.
