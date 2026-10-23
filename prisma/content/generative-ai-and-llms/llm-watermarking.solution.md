**Goal:** embed an invisible, statistically detectable signal in generated text so it can later be identified as machine-generated, without hurting quality much.

**Green/red list scheme (Kirchenbauer et al., 2023)**

1. At each step, hash the **previous token** with a secret key to seed a random generator.
2. Use it to split the vocabulary into a **green list** (fraction `gamma`, for example 50%) and a **red list**.
3. Add a bias `delta` to the **logits of green tokens** before sampling, so green tokens are slightly more likely.

```python
def watermark_logits(logits, prev_token, key, gamma=0.5, delta=2.0):
    g = torch.Generator().manual_seed(hash((key, int(prev_token))) % 2**31)
    green = torch.randperm(logits.size(-1), generator=g)[: int(gamma * logits.size(-1))]
    logits[green] += delta
    return logits
```

**Detection** (no model needed, only the key): recompute the green list for each token and count green tokens `|s|_G` among `T` tokens. Under the null hypothesis (human text) the expected fraction is `gamma`, so

`z = (|s|_G - gamma * T) / sqrt(T * gamma * (1 - gamma))`

A large `z` (for example above 4) means watermarked, with a known false-positive rate.

**Other approaches:** Google's SynthID-Text (tournament sampling that preserves the output distribution), distortion-free schemes based on keyed sampling, and post-hoc classifiers (unreliable).

**Weaknesses:** needs enough tokens (short texts are inconclusive); **paraphrasing, translation or token substitution weaken it**; low-entropy text (code, facts) carries little signal; can be learned or spoofed; requires cooperation of the model provider and does not cover open-weight models.
