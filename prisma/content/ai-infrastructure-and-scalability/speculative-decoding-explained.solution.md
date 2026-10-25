**Problem:** autoregressive decoding generates one token per forward pass, and each pass is **memory-bound** (reading all weights), so the GPU's compute is mostly idle.

**Idea:** a cheap **draft** mechanism proposes $\gamma$ tokens; the large **target** model **verifies all of them in one parallel forward pass** (cost about the same as one decode step because it is memory-bound). Accepted tokens are kept, so one target pass yields several tokens.

**Algorithm (Leviathan et al., Chen et al., 2023)**

1. Draft model $q$ autoregressively generates $x_1..x_\gamma$.
2. Target model $p$ computes probabilities for all $\gamma+1$ positions in parallel.
3. For each token $i$: accept with probability $\min(1, p(x_i)/q(x_i))$. At the first rejection, **resample** from the normalised residual $\max(0, p - q)$ and stop. If all accepted, sample a bonus token from $p$.

This **exactly preserves the target model's output distribution** (lossless), unlike approximations.

**Speedup:** with per-token acceptance rate $\alpha$ and draft length $\gamma$, expected tokens per target pass = $\frac{1-\alpha^{\gamma+1}}{1-\alpha}$. Example: $\alpha=0.8,\gamma=4$ gives about **3.4 tokens/pass**. Real speedup = that divided by the extra cost of drafting (draft cost ratio $c$): roughly **2 to 3x** typical.

```python
def expected_tokens(alpha, gamma): return (1 - alpha**(gamma + 1)) / (1 - alpha)
print(expected_tokens(0.8, 4))     # 3.36
```

**Drafting options:** small draft model of the same family (e.g. 1B for 70B), **Medusa heads**, **EAGLE** feature-level draft, **n-gram / prompt lookup**, self-speculation (layer skipping), multi-token prediction heads.

**When it helps:** low-to-moderate batch sizes, latency-sensitive workloads, predictable text (code, structured output, summarisation with copying), good draft alignment. **When it hurts:** high-throughput large-batch serving (compute already saturated, verification of rejected tokens wastes compute), poorly aligned drafts, high temperature sampling (lower acceptance).

**Practice:** tune $\gamma$, use tree-based verification to explore multiple candidates, monitor acceptance rate, and check engine support (vLLM, SGLang, TensorRT-LLM).
