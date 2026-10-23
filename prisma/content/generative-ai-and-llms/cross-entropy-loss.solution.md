**Definition.** For a true distribution `y` (one-hot) and predicted distribution `p`:

`H(y, p) = - sum_i y_i log p_i`

For a one-hot target this is just `- log p(correct token)`. For a language model it is averaged over all positions:

`L = -(1/T) * sum_t log p_theta(x_t | x_<t)`

Minimising it is **maximum likelihood**: make the observed text as probable as possible. It is also `H(y) + KL(y || p)`, so it pushes the model distribution toward the data distribution.

**Why it works well**

- Penalises confident wrong answers heavily (`-log 0.01 = 4.6` vs `-log 0.9 = 0.1`).
- With softmax, the gradient wrt the logits is simply `p - y`, which is smooth and does not vanish when the model is wrong.

```python
import torch, torch.nn.functional as F

logits = torch.randn(4, 50_000)           # [tokens, vocab] raw scores
targets = torch.randint(0, 50_000, (4,))
loss = F.cross_entropy(logits, targets)   # applies log-softmax internally; do NOT softmax first
ppl = loss.exp()                          # perplexity
```

**Perplexity** `= exp(L)` is the effective number of equally likely tokens the model is choosing among; lower is better, and it is only comparable between models with the same tokenizer.

**Gotchas:** pass raw logits, not probabilities; mask padding tokens (`ignore_index`); loss can fall without accuracy changing because it measures confidence.
