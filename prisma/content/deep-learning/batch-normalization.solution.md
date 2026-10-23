**What it does:** for each feature (channel) it normalises activations using the mini-batch mean and variance, then applies a learned scale and shift:

`x_hat = (x - mu_B) / sqrt(var_B + eps)`,  `y = gamma * x_hat + beta`

`gamma` and `beta` are learned, so the network can undo the normalisation if that is useful.

**Why it helps**

- **Stabler, faster training:** activations stay in a sane range, so you can use larger learning rates.
- **Better gradient flow:** keeps values out of saturated regions of sigmoid/tanh, which mitigates vanishing gradients.
- **Less sensitive to initialisation.**
- **Mild regularisation:** batch statistics add noise.

**Training vs inference**

- Training: uses the statistics of the current batch and updates **running averages**.
- Inference: uses the stored running mean/variance, so predictions do not depend on other samples in the batch.

```python
import torch.nn as nn

block = nn.Sequential(
    nn.Conv2d(3, 32, 3, padding=1),
    nn.BatchNorm2d(32),
    nn.ReLU(),
)
model.train()   # batch statistics
model.eval()    # running statistics: forgetting this is a classic bug
```

**Limitations and alternatives**

- Behaves badly with very small batches or variable-length sequences.
- **LayerNorm** normalises across features within one sample, independent of batch size; it is the standard in Transformers/LLMs. GroupNorm is common for small-batch vision.
