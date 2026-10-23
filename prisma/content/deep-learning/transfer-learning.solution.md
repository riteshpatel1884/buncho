**Idea:** reuse a model pre-trained on a large dataset (ResNet on ImageNet, BERT on text) as the starting point for a new, related task. Early layers learn general features (edges, syntax) that transfer; later layers are task-specific.

**Benefits:** needs far less labelled data, trains faster, and usually reaches higher accuracy than training from scratch.

**Two approaches**

| | Feature extraction | Fine-tuning |
|---|---|---|
| What is trained | Only a new head | Head plus some or all pre-trained layers |
| Data needed | Small | Medium |
| Learning rate | Normal for the head | Small for the backbone (e.g. 1e-5) |
| Risk | Underfitting if domains differ | Overfitting / forgetting if too aggressive |

**Rule of thumb:** small dataset + similar domain -> freeze and train the head. More data or a different domain -> unfreeze progressively with a low learning rate.

```python
import torch, torch.nn as nn
from torchvision import models

model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
for p in model.parameters():
    p.requires_grad = False                       # freeze backbone
model.fc = nn.Linear(model.fc.in_features, 5)     # new head for 5 classes

opt = torch.optim.AdamW(model.fc.parameters(), lr=1e-3)
# later: unfreeze model.layer4 and use a lower lr for it
```

**Gotchas:** use the same input normalisation as the pre-trained model; keep BatchNorm in eval mode when freezing; check licence and data bias of the base model. For LLMs, parameter-efficient methods such as LoRA are the transfer-learning equivalent.
