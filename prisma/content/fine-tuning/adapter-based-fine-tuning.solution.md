**Adapters** are small trainable **bottleneck modules inserted inside each Transformer block** while the pretrained weights stay **frozen**.

**Structure:** down-project, non-linearity, up-project, plus a residual connection:

```python
import torch.nn as nn
class Adapter(nn.Module):
    def __init__(self, d_model, bottleneck=64):
        super().__init__()
        self.down, self.up, self.act = nn.Linear(d_model, bottleneck), nn.Linear(bottleneck, d_model), nn.GELU()
        nn.init.zeros_(self.up.weight)\; nn.init.zeros_(self.up.bias)   # starts as identity
    def forward(self, x):
        return x + self.up(self.act(self.down(x)))
```

- Placed after the attention and/or feed-forward sub-layers (Houlsby: both\; Pfeiffer: after the FFN only).
- Parameters per adapter: $2\,d\,m$ for bottleneck size $m$\; typically 1% to 4% of the model.
- Zero-initialised up-projection means training starts from the original model's behaviour.

**Why use them:** a separate small module per task or language\; can be **stacked, fused or swapped** (AdapterFusion)\; the frozen base prevents forgetting\; cheap to store.

**vs LoRA**

| | Adapters | LoRA |
|---|---|---|
| Location | New sequential layers | Parallel low-rank update on existing weights |
| Inference | Extra layers add a little **latency** (cannot be folded away) | **Mergeable**, zero latency |
| Popularity | Earlier (BERT era), still used in multi-task/multilingual setups | Default for LLMs |

Both are PEFT methods and reach similar quality on many tasks.
