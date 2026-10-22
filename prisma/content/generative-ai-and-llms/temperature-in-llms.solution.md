## Definition

**Temperature** $T$ is a sampling parameter that rescales the model's logits before softmax, controlling how **sharp or flat** the next-token distribution is.

$$p_i=\frac{\exp(z_i/T)}{\sum_j\exp(z_j/T)}$$

- $T=1$: the model's original distribution.
- $T<1$: sharper, so high-probability tokens become even more likely (more deterministic).
- $T>1$: flatter, so low-probability tokens get more chance (more random).
- $T\to0$: converges to **greedy decoding** (argmax). Implementations treat $T=0$ as greedy since division by zero is undefined.
- $T\to\infty$: approaches a uniform distribution.

Temperature does **not change the ranking** of tokens, only how much probability mass the top ones get.

## Numeric example

Logits $z=[2,1,0]$ for tokens A, B, C:

| $T$ | $p_A$ | $p_B$ | $p_C$ |
|---|---|---|---|
| 0.5 | 0.87 | 0.12 | 0.02 |
| 1.0 | 0.67 | 0.24 | 0.09 |
| 2.0 | 0.51 | 0.31 | 0.19 |

## Effects on output

- **Low T (0 to 0.3):** consistent, focused, repeatable. Good for extraction, classification, code, factual Q&A, structured output. Risk: dull, repetitive loops.
- **Medium T (0.5 to 0.8):** a balance for chat and writing.
- **High T (above 1):** diverse, creative, but increasingly incoherent, with more factual errors and odd words.

## Practical notes

- Temperature **does not reduce hallucination by itself**. A model can be confidently wrong at $T=0$.
- Even $T=0$ is **not perfectly deterministic** in production: floating-point non-associativity, batching and kernel differences can change results slightly. Use a seed where available and do not assume bit-exact outputs.
- It is applied **before** top-k / top-p truncation in most implementations, so the two interact: a high temperature flattens the distribution and makes top-p keep more tokens.
- Tune one randomness knob at a time; many API guides advise changing temperature or top-p, not both.
- For tasks needing correctness, run low temperature; for diversity (brainstorming, many candidates, self-consistency voting) use higher temperature and sample several times.

## Code

```python
import numpy as np

def sample_with_temperature(logits, T=1.0):
    if T == 0:
        return int(np.argmax(logits))
    z = np.asarray(logits) / T
    z -= z.max()                      # numerical stability
    p = np.exp(z) / np.exp(z).sum()
    return int(np.random.choice(len(p), p=p))
```
