## Short answer

Both methods **truncate the tail** of the next-token distribution before sampling, so the model cannot pick very unlikely tokens.

- **Top-k:** keep the $$k$$ most probable tokens, renormalise, sample.
- **Top-p (nucleus):** keep the smallest set of top tokens whose cumulative probability is at least $$p$$, renormalise, sample.

## The key difference: fixed vs. adaptive

Top-k always keeps the same number of candidates. Top-p keeps a number that depends on how confident the model is.

| Situation | Top-k with $$k=50$$ | Top-p with $$p=0.9$$ |
|---|---|---|
| Model is very confident (one token has 95%) | Still allows 49 other tokens, some of them junk | Keeps just 1 token |
| Distribution is flat (hundreds of reasonable continuations) | Cuts off valid options after 50 | Keeps as many as needed to reach 90% |

Top-p therefore tends to behave better across both easy and open-ended positions. Top-k is simpler and cheaper, and the two are often combined.

## Code sketch

```python
import numpy as np

def softmax(x):
    x = x - x.max()
    e = np.exp(x)
    return e / e.sum()

def sample(logits, temperature=1.0, top_k=0, top_p=1.0, rng=None):
    rng = rng or np.random.default_rng()
    probs = softmax(np.asarray(logits, dtype=np.float64) / max(temperature, 1e-8))
    order = np.argsort(-probs)                 # most likely first
    sorted_p = probs[order]

    keep = np.ones_like(sorted_p, dtype=bool)
    if top_k > 0:
        keep[top_k:] = False
    if top_p < 1.0:
        cum = np.cumsum(sorted_p)
        keep &= (cum - sorted_p) < top_p       # keep tokens until mass reaches p
    sorted_p = np.where(keep, sorted_p, 0.0)
    sorted_p /= sorted_p.sum()
    return int(rng.choice(order, p=sorted_p))
```

The condition `(cum - sorted_p) < top_p` keeps a token if the probability mass *before* it is still below $$p$$, which includes the token that crosses the threshold and always keeps the top token.

## Combining with temperature

A common pipeline is: **temperature, then top-k, then top-p, then sample**. Exact order and defaults vary between libraries and APIs, so check the one you use. Many providers recommend adjusting temperature **or** top-p, not both aggressively at once.

## Related method

**min-p** keeps tokens whose probability is at least a fraction of the top token's probability, which also adapts to confidence.

## Interview follow-up

*"What are good starting values?"* For open-ended text, $$p$$ around 0.9 to 0.95 with a moderate temperature is a common starting point. For extraction or code, use low temperature and little or no truncation. Tune against your own evals.
