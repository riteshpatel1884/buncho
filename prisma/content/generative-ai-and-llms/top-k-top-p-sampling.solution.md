Both methods **truncate** the next-token distribution to a "safe" set of candidates, **renormalise**, and sample from that set. This removes the long tail of unlikely tokens that pure sampling would occasionally pick and that tends to derail text.

## Top-k

Keep the $k$ highest-probability tokens, zero out the rest, renormalise, sample.

- $k=1$ is greedy decoding. Typical values are 20 to 100.
- The set size is **fixed**, whatever the shape of the distribution.

## Top-p (nucleus sampling, Holtzman et al., 2020)

Sort tokens by probability and keep the **smallest set whose cumulative probability is at least $p$** (for example 0.9). Renormalise and sample.

- The set size is **adaptive**: small when the model is confident, large when it is uncertain.

## Example

Probabilities: A 0.50, B 0.20, C 0.12, D 0.08, E 0.05, F 0.03, G 0.02.

- **Top-k, $k=3$:** keep A, B, C (mass 0.82), renormalise to 0.61, 0.24, 0.15.
- **Top-p, $p=0.9$:** cumulative 0.50, 0.70, 0.82, 0.90. Keep A, B, C, D (mass 0.90).

If the model were near-certain (A = 0.97), top-p at 0.9 would keep **only A**, while top-k would still keep 3 candidates, including junk.

## Key differences

| | Top-k | Top-p |
|---|---|---|
| Rule | Fixed count | Fixed probability mass |
| Adapts to confidence | No | Yes |
| Failure when distribution is flat | Cuts away many valid options | Keeps many, which is correct |
| Failure when distribution is peaked | Keeps unlikely junk tokens | Keeps one or two tokens |
| Main knob range | 1 to 100 | 0.8 to 0.98 |

## When each fails

- **Top-k:** a bad fixed $k$ is wrong somewhere. After "The capital of France is" only 1 token is sensible, yet $k=50$ allows 49 bad ones. In open-ended creative text, $k=10$ may cut off many good words.
- **Top-p:** with a very flat distribution and high $p$ the set can still be huge and include poor tokens. With a very low $p$ it behaves like greedy and loops. It also can't enforce a minimum quality on individual tokens (that is the purpose of **min-p**, which keeps tokens above a fraction of the top token's probability).

## In practice

- The usual order is **temperature, then top-k and/or top-p, then sample**. Temperature changes the shape that top-p then cuts.
- They can be combined (top-k as a hard cap, top-p as the adaptive cut).
- Typical defaults: temperature 0.7, top-p 0.9 to 0.95.
- For deterministic or factual tasks, use low temperature (or greedy) instead of relying on truncation.

```python
import numpy as np

def top_p_sample(probs, p=0.9):
    idx = np.argsort(probs)[::-1]
    csum = np.cumsum(probs[idx])
    cut = np.searchsorted(csum, p) + 1          # smallest set with mass >= p
    keep = idx[:cut]
    q = probs[keep] / probs[keep].sum()
    return int(np.random.choice(keep, p=q))
```
