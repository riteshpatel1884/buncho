**Idea:** instead of attending to all previous tokens, each token attends only to the last `w` tokens (plus itself). The attention mask is a **band** along the diagonal.

```python
import torch
def sliding_window_mask(n, w):
    i = torch.arange(n)[:, None]; j = torch.arange(n)[None, :]
    return (j <= i) & (j > i - w)      # causal AND within window
```

**Cost:** `O(n * w)` compute and the KV cache is capped at `w` tokens per layer, instead of `O(n^2)` and an ever-growing cache.

**Long-range information:** stacking `L` layers gives an effective receptive field of about `L x w`. A token at layer 2 sees tokens that layer 1 had already mixed from further back (like stacked convolutions). Mistral 7B uses `w = 4096` with 32 layers (about 131k tokens of theoretical reach).

**Weaknesses**

- Exact recall of facts outside the window degrades (information is diluted as it is passed along).
- Removing the first tokens hurts (see attention sinks).
- Needs special kernels to realise the speed-up.

**Common practice:** mix a few global (full-attention) layers with many local ones, or combine with attention sinks / global tokens (Longformer, Gemma, Mistral).
