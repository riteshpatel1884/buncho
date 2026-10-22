## What the data shows

- The right chunk (India paternity policy) is only **rank 3**, and all five scores sit between 0.77 and 0.81. The retriever barely separates relevant from irrelevant.
- Results come from **three countries** and from a FAQ. The system knows the user's country (`IN`) and the index has a `country` field, but `filters` is `null`.
- Chunks are **1,500 characters with no overlap and no headings**. A chunk like "Leave types: casual, sick..." has lost its section context, so it looks similar to many queries.
- Offline recall@5 is only **0.55**, so this is a systemic retrieval problem, not one bad query.

## Likely root causes, in order

1. **No metadata filtering** (country / doc type). Cheapest test: re-run the 40 labelled queries with `country` filtered and compare recall@5.
2. **Weak chunks**: fixed-size cuts that drop headings. Test: re-chunk by section and prepend "document > section" to each chunk, then re-embed a sample.
3. **Dense-only matching**: exact terms like "paternity" matter. Test: add BM25 and fuse the rankings (reciprocal rank fusion).
4. **No reranker** to separate near-tied candidates. Test: rerank the top 20 with a cross-encoder.

## Fix, in order

Metadata filter first (largest gain, almost free), then structure-aware chunking with context headers, then hybrid retrieval, then a reranker on the top 20 to 30 candidates.

## Measure and monitor

- Change **one thing at a time** and track recall@k and MRR on the labelled set; also keep a held-out set to avoid overfitting.
- Look at retrieval before touching prompts or the model, since generation was already confirmed faithful.
- In production, log the retrieved chunks, scores and filters; track recall on a sampled, human-labelled set, the rate of "no good context" answers, and thumbs-down by document source.