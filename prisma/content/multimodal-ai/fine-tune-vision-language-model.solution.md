**1. Decide if you need it:** try prompting, few-shot examples, better resolution/tiling, OCR/tool augmentation and RAG first. Fine-tune for domain visuals (medical, industrial defects, charts), strict output formats, specialised terminology, or small/cheap deployments.

**2. Data**

- Image(s) + instruction/question + target answer (conversation format with an `<image>` placeholder), typically **1k to 50k** quality examples; include **diverse prompts**, negative/"not present" cases, and multi-image/multi-turn samples if needed.
- Mix in **general instruction data** (5-30%) to avoid catastrophic forgetting.
- Clean labels, deduplicate, hold out an eval set by source/patient/document, keep resolution consistent with deployment; augment (crops, colour jitter) carefully.

**3. What to train**

| Strategy | Trainable | Use |
|---|---|---|
| **Projector only** | Connector | Cheap alignment to a new encoder/domain vocabulary |
| **LoRA/QLoRA on LLM** | Low-rank adapters on attention/MLP layers (encoder and projector frozen or LoRA too) | Default; fits on one GPU |
| **LoRA + unfreeze vision encoder (lower LR)** | Adapts perception to new visuals | When image domain differs a lot from web images |
| **Full fine-tune** | Everything | Large data/compute budgets |
| **Preference tuning (DPO)** | After SFT | Reduce hallucination, improve style |

```python
# sketch with Hugging Face PEFT + TRL
from peft import LoraConfig
cfg = LoraConfig(r=16, lora_alpha=32, target_modules=["q_proj","k_proj","v_proj","o_proj"], task_type="CAUSAL_LM")
# model = get_peft_model(vlm, cfg); train on chat-formatted (image, question, answer) batches
# lr ~1e-4 for LoRA (2e-5 or lower for any unfrozen vision layers), 1-3 epochs, bf16, gradient checkpointing
```

**4. Practical points:** use the model's **own chat/image template and processor** exactly; mask loss to assistant tokens only; control max image tokens/resolution (memory); watch overfitting (small data, many epochs); evaluate on held-out domain set plus general benchmarks (MMMU/MMBench) for regression; test hallucination (POPE) and robustness.

**5. Deploy:** merge or serve adapters, quantise, version the dataset/adapters, and keep a regression suite.
