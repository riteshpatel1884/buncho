**Soft prompts:** learn continuous vectors (not real tokens) that steer a **frozen** model.

| Method | What is learned | Where |
|---|---|---|
| **Prompt tuning** | $n$ virtual token embeddings | Prepended **only at the input embedding layer** |
| **Prefix tuning** | Trainable key/value prefix vectors (via a small MLP during training) | Prepended to the **K and V of every attention layer** |
| **P-tuning (v1/v2)** | Trainable prompt embeddings, v2 deep prompts at every layer | Input (v1) or all layers (v2) |

```python
from peft import PromptTuningConfig, PrefixTuningConfig, get_peft_model
model = get_peft_model(base, PromptTuningConfig(task_type="CAUSAL_LM", num_virtual_tokens=20))
# or PrefixTuningConfig(task_type="CAUSAL_LM", num_virtual_tokens=30)
```

**vs LoRA**

| | Prompt/prefix tuning | LoRA |
|---|---|---|
| Mechanism | Adds **extra context vectors**\; weights untouched | Adds **low-rank weight updates** |
| Trainable params | Very few (thousands to ~1M) | ~0.1 to 2% |
| Quality | Weak on small models and hard tasks\; closes the gap only at multi-billion scale (prompt tuning)\; prefix tuning better | Strong across sizes |
| Inference | Uses part of the context window\; cannot merge into weights | Merge into weights, no overhead |
| Stability | Sensitive to initialisation and learning rate | Robust |
| Multi-task serving | Swap tiny prompt per task | Swap adapters per task |

**In practice:** LoRA/QLoRA dominates for LLMs. Soft prompts are useful when you need an extremely tiny per-task artefact and batch many tasks in one forward pass, or for research. Note soft prompts are not human-readable and cannot be inspected like text prompts.
