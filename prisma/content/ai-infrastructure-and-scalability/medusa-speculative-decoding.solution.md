**Medusa** (Cai et al., 2024) removes the separate draft model by adding several extra **decoding heads** to the base LLM, so a single model drafts and verifies.

**Mechanism**

1. **Medusa heads:** $K$ lightweight heads (a small MLP/residual layer + the LM head) attached to the **last hidden state**. Head $k$ predicts the token at offset $+k+1$ (head 1: token t+2, head 2: t+3, ...) while the original LM head predicts t+1.
2. **Candidates:** take top-$s_k$ predictions from each head; the Cartesian product forms many candidate continuations, organised as a **tree** (pruned with a fixed tree structure to limit size).
3. **Tree attention:** a custom attention mask lets every candidate path attend only to its own ancestors, so the whole tree is **verified in one forward pass**.
4. **Acceptance:** accept the longest candidate prefix matching what the base model would generate (greedy exact match, or **typical acceptance** for sampling, accepting plausible tokens under a probability threshold), then continue from there.

**Training**

- **Medusa-1:** freeze the backbone, train only the heads (cheap, lossless for greedy).
- **Medusa-2:** fine-tune backbone + heads jointly (higher acceptance, needs care to preserve quality; use self-distillation data).

**Results:** about **2.2x** (Medusa-1) to **2.3 to 3.6x** (Medusa-2) fewer decoding steps/latency on Vicuna-style models at batch 1.

**Pros:** no second model to host or align, small memory overhead, simple deployment, works with fine-tuned models via self-distillation.

**Cons:** heads must be trained per model; head predictions are independent of each other's sampled tokens (weaker than autoregressive drafts, lower acceptance for deeper positions); typical-acceptance isn't strictly distribution-preserving; gains shrink at high batch sizes. **EAGLE** improves on this by drafting autoregressively at the feature level.
