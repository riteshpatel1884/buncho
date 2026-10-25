**EAGLE** (Extrapolation Algorithm for Greater Language-model Efficiency, Li et al., 2024) is a speculative decoding method whose **draft model works on the target model's hidden features** instead of tokens.

**Key observations**

- The **second-to-top layer features** (input to the LM head) of the target model are smoother and more predictable than discrete tokens, so extrapolating them is easier for a small model.
- Feature prediction is uncertain because of the **sampling randomness** in which token actually gets chosen. EAGLE resolves this by feeding the **token sequence advanced by one step** (the actual sampled token) along with the previous features.

**Architecture**

- A tiny **draft head** (one Transformer decoder layer + fused embedding of token and feature) predicts the next feature $f_{t+1}$ from $(f_{\le t}, x_{\le t+1})$; the **target's frozen LM head** converts predicted features to token distributions.
- Drafting is **autoregressive on features** for $\gamma$ steps, building a **draft tree** (several top candidates per step).
- The target model **verifies the tree in one pass** with tree attention using standard speculative sampling, so output distribution matches the target exactly (lossless, including sampling).

**Versions**

| Version | Improvement |
|---|---|
| **EAGLE-1** | Feature-level drafting, ~2.7 to 3x speedup (LLaMA-2-chat 70B) |
| **EAGLE-2** | **Dynamic draft trees** guided by the draft model's confidence (acceptance probability approximated by draft score) → ~3 to 4x |
| **EAGLE-3** | Predicts tokens directly using **fused low/mid/high-layer features** and a training-time test procedure; better scaling with data; up to ~5x and effective at larger batch sizes |

**Compared with Medusa:** EAGLE's draft is autoregressive and conditions on previous drafts (higher acceptance), at a slightly larger draft cost; both avoid a separate full draft LLM but need training a small head (a few GPU-hours to days on ShareGPT-like or self-generated data).

**Support:** vLLM, SGLang, TensorRT-LLM speculative backends. Monitor **acceptance length** and tune tree size/depth versus batch size.
