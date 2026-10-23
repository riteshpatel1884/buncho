**LayerNorm** normalises each token's feature vector independently:

`y = gamma * (x - mean(x)) / sqrt(var(x) + eps) + beta`  (mean and variance over the feature dimension)

```python
import torch.nn as nn
ln = nn.LayerNorm(768)       # same computation in training and inference
```

| | BatchNorm | LayerNorm |
|---|---|---|
| Statistics over | Batch (and spatial) dimension, per feature | Feature dimension, per sample/token |
| Depends on batch | Yes | No |
| Train vs eval behaviour | Different (running averages) | Identical |
| Small batches / variable-length text | Unstable | Fine |
| Typical use | CNNs | Transformers, RNNs |

**Why Transformers use LayerNorm:** sequences have variable length and padding, batches can be small or sharded across devices, and autoregressive inference processes one token at a time, so batch statistics are unreliable or undefined. LayerNorm gives each token a stable scale regardless of the batch.

**Effect:** keeps activations at a steady scale so deep stacks train stably and tolerate higher learning rates. Modern LLMs often replace it with RMSNorm.
