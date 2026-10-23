**Goal:** keep updating a model with new knowledge, skills or domains over time **without** retraining from scratch and without losing what it already knows.

**Catastrophic forgetting:** gradient updates on new data overwrite weights that encoded older capabilities, so performance on earlier tasks drops. Related issues: loss of safety behaviour after fine-tuning, and the **stability-plasticity** dilemma (learn new things versus keep old ones).

**Strategies**

| Approach | Idea |
|---|---|
| **Replay / data mixing** | Mix a sample of old data (or general data) into each new training run |
| **Regularisation** | Penalise changes to important weights (EWC), or KL to the previous model |
| **Parameter-efficient adapters** | Train LoRA/adapters per domain, leave base weights frozen; swap or merge them |
| **Model merging / interpolation** | Average weights of old and new models (task arithmetic, WiSE-FT) |
| **Low learning rate, short runs** | Less drift |
| **Retrieval (RAG) and tools** | Put changing facts outside the weights |
| **Periodic full retrain** | Fold in data at scheduled intervals |
| **Model editing** | Patch individual facts (still fragile) |

```python
from peft import LoraConfig, get_peft_model
model = get_peft_model(base, LoraConfig(r=16, lora_alpha=32, target_modules=["q_proj", "v_proj"]))
# train on new-domain data mixed with 20% replay of general data
```

**Practical rule:** use RAG for facts that change often, adapters for new skills or styles, and measure old-task benchmarks after every update to catch regressions.
