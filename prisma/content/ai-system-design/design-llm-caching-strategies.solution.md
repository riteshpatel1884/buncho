| Layer | What is cached | Hit condition | Saves | Risk |
|---|---|---|---|---|
| **Provider prompt/prefix caching** | KV state of a repeated prompt prefix | Identical prefix (system prompt, docs, few-shot) | Input cost and TTFT (often large discounts) | Needs stable prefix ordering |
| **Exact response cache** | Full answer keyed by hash(model, prompt, params) | Identical request | Whole call | Only for deterministic calls; staleness |
| **Semantic cache** | Answer keyed by query **embedding** similarity | Similar meaning above threshold | Whole call | **Wrong hits**; leakage across users |
| **Embedding cache** | Vectors for repeated texts | Same text and model | Embedding calls | Model version mismatch |
| **Retrieval cache** | Top-k results for a query/filter | Same query + same index version | Vector search/rerank | Stale after index updates |
| **Tool/API cache** | External call results (with TTL) | Same arguments | Latency and API cost | Stale data |
| **Inference-engine caches** | KV prefix caching in vLLM/SGLang | Shared prefixes | GPU compute | Memory pressure |

**Design guidance**

1. **Structure prompts for prefix caching:** static content first (system prompt, tools, documents), variable user content last.
2. **Cache keys must include everything that changes the output:** model/version, prompt template version, parameters, tools, user/tenant scope, language, and (for RAG) the **index/knowledge version**.
3. **Scope by tenant/user** for anything personalised or permission-sensitive; never share answers across access boundaries.
4. **TTL and invalidation:** short TTL for time-sensitive answers; event-based invalidation when documents or prompts change.
5. **Semantic cache safety:** high similarity threshold tuned on labelled pairs, verification for risky intents, never for personalised or tool-dependent answers; measure wrong-hit rate.
6. **Do not cache** errors, refusals, non-deterministic creative outputs, or sensitive data without need.
7. **Stampede protection:** single-flight (one request per key), stale-while-revalidate.
8. **Observability:** hit rate per layer, cost saved, latency saved, and sampled correctness audits of cache hits.

**Typical stack for a RAG chatbot:** prefix caching for the system prompt and policy, an embedding cache, a retrieval cache keyed by index version, a tightly scoped semantic cache for FAQs, and exact cache for deterministic batch jobs.
