**Requirements:** feed/item recommendations under about 100 to 200 ms, millions of users and items, fresh signals (clicks within the session), cold start for new users and items, experimentation.

**Funnel architecture**

```text
Event stream (clicks, views, purchases) -> Kafka/stream processor -> online feature store (user/session/item)
                                        -> offline store/data lake -> training (two-tower, ranking models)
Request -> Candidate generation (several sources, ~1000 items)
        -> Pre-ranking (light model) -> Ranking (deep model, ~100 items) -> Re-ranking (diversity, rules, business)
        -> Response + impression logging
```

**Stages**

1. **Candidate generation:** **two-tower** embeddings with **ANN** retrieval (user/session embedding vs item embeddings), collaborative filtering, popularity/trending, recent-interest and content-based sources, merged and deduplicated.
2. **Ranking:** model predicts multiple objectives (click, purchase, watch time, dislike) from user, item, context and cross features (GBDT or deep models such as DLRM/DCN), combined into a utility score.
3. **Re-ranking:** diversity, freshness, fairness/creator exposure, ad slots, business constraints, deduplication, safety filters.

**Real-time pieces**

- **Streaming features** (last N actions, session intent) in a low-latency feature store (Redis/Feast), with **point-in-time correct** training data to avoid training/serving skew.
- Session-based/sequence models (transformers over recent actions) for immediate adaptation.
- Frequent embedding and model refresh; incremental index updates for new items.
- **Cold start:** content embeddings for new items, metadata/popularity priors, **exploration** (bandits) for new items and users.

**Evaluation:** offline (recall@k, NDCG, AUC, calibration), **online A/B tests** (CTR, conversion, retention, long-term value), guardrail metrics (diversity, complaints, latency). Beware **feedback loops and popularity bias**; log counterfactual/propensity data for unbiased evaluation.

**Reliability:** cached fallback recommendations (popular/last-known) when models or features fail; timeouts per stage.
