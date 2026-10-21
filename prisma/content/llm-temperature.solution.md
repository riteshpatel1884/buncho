## Short answer

**Temperature** $$T$$ rescales the model's logits before softmax, controlling how peaked or flat the next-token distribution is:

$$p_i=\frac{\exp(z_i/T)}{\sum_j \exp(z_j/T)}$$

- $$T<1$$: sharper. High-probability tokens become even more likely.
- $$T=1$$: the model's original distribution.
- $$T>1$$: flatter. Lower-probability tokens get more chance.
- $$T\to 0$$: approaches greedy decoding (always pick the highest logit).

Temperature never changes the *ranking* of tokens, only how much probability mass the top ones get.

## Example

Logits $$[2,\ 1,\ 0]$$ for three candidate tokens:

| Temperature | Token A | Token B | Token C |
|---|---|---|---|
| 0.5 | 0.867 | 0.117 | 0.016 |
| 1.0 | 0.665 | 0.245 | 0.090 |
| 2.0 | 0.506 | 0.307 | 0.186 |

## When to use what

| Task | Typical setting | Why |
|---|---|---|
| Extraction, classification, code, factual Q&A | Low (0 to about 0.3) | You want the most likely, repeatable answer |
| General chat | Moderate (about 0.5 to 0.8) | Natural variety, still coherent |
| Brainstorming, creative writing | Higher (about 0.8 to 1.2), often with top-p | Diversity matters more than precision |

These are starting points to tune against your own evals, not universal values.

## Pitfalls

- **$$T=0$$ is not a guarantee of identical outputs.** Batching, floating-point non-associativity and provider-side changes can still produce variation. Many APIs treat 0 as greedy decoding.
- **High temperature alone can derail long outputs**, because one unlikely token changes everything after it. Combine it with top-p or top-k truncation.
- **Low temperature is not "more accurate".** It makes the output more *likely*, which can still be wrong, and it increases repetition risk.
- Some reasoning-oriented models restrict or fix sampling parameters. Check the provider's documentation.

## Interview follow-up

*"How does temperature interact with top-p?"* A common order is temperature first, then truncation. Raising temperature flattens the distribution, so top-p keeps more tokens, and lowering it makes top-p keep fewer.
