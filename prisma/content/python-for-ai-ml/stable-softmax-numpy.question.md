Implement `softmax(x, axis=-1)` that works on a batch of logits with shape `(batch, classes)`.

1. Why does the naive `np.exp(x) / np.exp(x).sum()` fail for `x = [1000, 1001]`?
2. Make it stable and vectorised.
3. How would you add a temperature parameter, and how do you compute log-softmax stably?
