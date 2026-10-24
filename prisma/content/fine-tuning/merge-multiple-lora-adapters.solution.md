**1. Merge one adapter into the base (for deployment):**
$W = W_0 + \frac{\alpha}{r}BA$. No extra latency, but you can no longer swap or turn off the adapter.

```python
from peft import PeftModel
base = AutoModelForCausalLM.from_pretrained("base", torch_dtype=torch.bfloat16)
model = PeftModel.from_pretrained(base, "adapter_a").merge_and_unload()
model.save_pretrained("merged")
```

**2. Combine several adapters**

- **Keep separate and route:** load several adapters on one base and pick per request (multi-LoRA serving: vLLM, LoRAX). No merging errors, best isolation.
- **Weighted merge of the updates:** $W=W_0+\sum_i w_i\,\Delta W_i$ with $\Delta W_i=\frac{\alpha}{r}B_iA_i$. Do **not** average $A$ and $B$ separately: $(B_1+B_2)(A_1+A_2)\ne B_1A_1+B_2A_2$ because of cross terms.
- **Smarter merging** to reduce interference: **TIES** (trim small values, resolve sign conflicts, merge agreeing parameters), **DARE** (randomly drop and rescale deltas), task arithmetic (add or subtract task vectors), SVD-based re-factorisation to a new rank.

```python
model.add_weighted_adapter(adapters=["legal", "style"], weights=[0.7, 0.5],
                           adapter_name="legal_style", combination_type="ties",
                           density=0.5)
model.set_adapter("legal_style")
```

**What can go wrong**

- **Interference:** adapters trained for different tasks push the same weights in conflicting directions, degrading both; weights must be tuned.
- Different **base models, ranks or target modules** make adapters incompatible (must share the same base).
- Merging into a **quantised** base needs de-quantise, merge, re-quantise (precision loss).
- Merged skills are usually diluted compared with single adapters.

**Always evaluate** the merged model on every contributing task and on general benchmarks; use merging for cheap multi-skill models, but prefer separate adapters or multi-task training when quality is critical.
