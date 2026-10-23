**Caveat:** this summarises public descriptions of the April 2026 release. Exact figures (expert counts, layer ratios) should be checked against the official technical report before quoting them in an interview.

**Headline design**

- **Sparse MoE at large scale.** Reported as roughly 1.6T total parameters with about 49B active per token (V4 Pro) and about 284B total / 13B active (V4 Flash), compared with about 671B / 37B for V3. Only a few experts run per token, so quality scales with total parameters while compute scales with active ones. Load balancing without a heavy auxiliary loss, shared experts and fine-grained experts carry over from V3.
- **Million-token context through hybrid compressed attention.** Layers interleave a *compressed sparse attention* type (compress the sequence by a few times, then pick top blocks with a cheap indexer) and a *heavily compressed attention* type (compress aggressively, then attend densely). This cuts both attention FLOPs and KV cache by large factors at 1M tokens compared with V3.2.
- **Learned residual connectivity.** Hyper-connection style mixing between sublayers replaces plain `x + f(x)`, aiming at better stability and richer information flow in very deep MoE stacks (see `residual-connections-transformers`).
- **Training/efficiency choices:** Muon-style optimiser, low-precision (FP8/FP4) training and expert weights with quantisation-aware training.

**Why it matters for engineers**

1. Active parameters, not total, determine per-token cost, but total parameters determine memory and number of GPUs.
2. Long context is mainly a **KV-cache and attention-cost** problem, so the innovation is in compressing it.
3. Open weights make self-hosting possible, but the serving stack (expert parallelism, quantisation) is non-trivial.
