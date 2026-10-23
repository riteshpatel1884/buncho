| | Prompt engineering | Prompt tuning | Fine-tuning (full or LoRA) |
|---|---|---|---|
| What changes | The text you send | Learned **soft prompt** embeddings prepended to the input; model frozen | Model weights (all, or low-rank adapters) |
| Who writes it | Human | Gradient descent | Gradient descent |
| Human-readable | Yes | No (continuous vectors) | No |
| Needs training data | No (a few examples) | Yes (hundreds to thousands) | Yes |
| Cost to change | Seconds | Minutes to hours | Hours to days |
| Needs weight access | No (works with APIs) | Yes (open models) | Yes (or provider fine-tuning API) |
| Typical gain | Format, tone, simple tasks | Task specialisation with tiny storage (a few thousand parameters per task) | Deep behaviour/domain change |

**Prompt tuning (Lester et al., 2021):** learn `k` virtual token embeddings that are prepended to the input and optimised for a task while all model weights stay frozen. Related: **prefix tuning** (learned vectors at every layer) and **P-tuning**. These are *parameter-efficient fine-tuning* methods, not prompt writing.

```python
from peft import PromptTuningConfig, get_peft_model, TaskType
cfg = PromptTuningConfig(task_type=TaskType.CAUSAL_LM, num_virtual_tokens=20)
model = get_peft_model(base_model, cfg)      # only the 20 virtual token embeddings are trainable
```

**Choosing**

1. Start with prompt engineering (cheap, fast, works with closed APIs).
2. Add RAG if the model lacks knowledge.
3. Use LoRA or fine-tuning when you have labelled data and need consistent behaviour, lower latency or shorter prompts.
4. Soft prompts suit many task-specific variants of one shared frozen model, but LoRA is more common today.

Do not confuse the names: "prompt tuning" is **not** manual prompt iteration.
