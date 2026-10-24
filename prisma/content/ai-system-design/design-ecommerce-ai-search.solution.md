**Requirements:** latency under 200 ms, millions of products with frequently changing price/stock, typo/synonym handling, filters and facets, personalisation, multi-language, measurable business impact.

**Architecture**

```text
Query -> Query understanding (normalise, spell-correct, language, entity/attribute extraction,
         intent classification: navigational / product / category / question; LLM rewrite for hard/long queries)
   -> Retrieval (hybrid): BM25/inverted index + dense vector retrieval (query/product embeddings)
        + filters (category, brand, price, in-stock) -> merge (RRF)
   -> Ranking: learning-to-rank (GBDT/neural) with relevance, popularity, price, margin, availability,
        freshness, personalisation, delivery speed -> multi-objective score
   -> Re-rank/blend: diversity, sponsored slots, business rules -> results + facets + "did you mean"
Offline: catalogue enrichment (LLM attribute extraction, taxonomy mapping, image embeddings), click logs -> training
```

**Design decisions**

- **Hybrid retrieval:** keyword matching is critical for model numbers, brands, SKUs; embeddings add semantic recall ("shoes for flat feet", "something for a gift").
- **Catalogue quality drives search quality:** LLMs normalise titles, extract attributes (size, colour, material), generate synonyms and descriptions, detect duplicates; multimodal embeddings from images.
- **Learning to rank from behaviour:** clicks, add-to-cart, purchases as labels with **position-bias correction**; interleaving and A/B tests for evaluation.
- **Personalisation:** user embeddings, past purchases, session context, location, price sensitivity, used carefully (cold start users get non-personalised defaults).
- **Freshness:** near-real-time updates for price/stock; availability as a ranking feature and filter.
- **Conversational/AI shopping assistant layer:** LLM that translates natural language to structured filters and queries (with guardrails against hallucinated products); always show real catalogue items.
- **Zero-result handling:** relaxation, spelling correction, semantic fallback, suggestions.
- **Cost/latency:** cache popular queries, ANN with filtering, compact rerankers, offload LLM rewriting to a few hard queries.

**Metrics:** NDCG with human judgments, CTR, add-to-cart and conversion, revenue per search, zero-result rate, query reformulation rate, latency p95, and fairness to sellers.
