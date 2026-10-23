**Core reason:** loss measures *confidence in the right answer*; accuracy measures only whether the arg-max is right. The model can become more confident on examples it already gets right, or move probabilities without crossing the decision boundary, so loss falls while the number of correct predictions stays constant.

**Example (binary):** a sample with true label 1 going from `p = 0.55` to `p = 0.90` lowers the loss a lot but was already counted as correct.

**Possible causes and checks**

1. **Normal behaviour:** accuracy changes only when predictions flip classes; wait for more epochs or look at validation log-loss.
2. **Class imbalance:** predicting the majority class gives high, flat accuracy while loss still improves on minority probabilities. Check precision/recall/F1 and the confusion matrix.
3. **Different data:** you are comparing *training* loss with *validation* accuracy; both should be computed on the same split.
4. **Metric bug:** wrong threshold, labels/logits mismatch, accidentally applying softmax twice, using `argmax` over the wrong axis.
5. **Overfitting:** training loss falls while validation accuracy plateaus; compare train and val curves.
6. **Saturated or wrong learning rate:** very small updates change probabilities but not decisions.

```python
import torch
logits = model(x)
loss = torch.nn.functional.cross_entropy(logits, y)        # needs raw logits
acc = (logits.argmax(dim=1) == y).float().mean()
probs = logits.softmax(dim=1)
print(loss.item(), acc.item(), probs.max(dim=1).values.mean().item())  # confidence
```

**Rule:** monitor several metrics (loss, accuracy, F1, calibration) on both train and validation sets before deciding something is wrong.
