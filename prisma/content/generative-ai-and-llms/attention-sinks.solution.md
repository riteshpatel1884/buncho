**Observation:** in trained autoregressive LLMs, the **first few tokens** receive a large share of attention from almost every later token, even when they are semantically irrelevant (for example a BOS token).

**Why:** softmax forces weights to sum to 1. When a head has nothing useful to attend to, it still needs somewhere to put the probability mass. The model learns to dump it on the first tokens, which are visible to every position in a causal model, so they act as a **sink** (a harmless "no-op").

**Consequence for long generation:** with a plain sliding window, once the first tokens are evicted from the KV cache the sink disappears. The attention distribution shifts, and perplexity and output quality collapse, even though the evicted text was irrelevant.

**StreamingLLM fix:** always keep the KV of the first few (about 4) tokens plus a rolling window of the most recent tokens:

```python
def evict(kv, n_sink=4, window=2048):
    if kv.size(0) <= n_sink + window:
        return kv
    return torch.cat([kv[:n_sink], kv[-window:]], dim=0)
```

This gives stable, constant-memory generation over millions of tokens.

**Limits:** the model still cannot recall facts from tokens that were evicted; sinks give stability, not long-term memory. Some newer models are trained with an explicit learned sink or gating to avoid wasting attention.
