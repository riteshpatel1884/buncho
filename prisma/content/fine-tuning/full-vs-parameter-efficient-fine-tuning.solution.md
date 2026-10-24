**Full fine-tuning** updates **all** weights. **PEFT** freezes the base model and trains a **small number of extra or selected parameters** (typically 0.1% to 2%).

| | Full fine-tuning | PEFT (LoRA, adapters, prefix) |
|---|---|---|
| Trainable params | 100% | ~0.1 to 2% |
| GPU memory | Weights + grads + optimizer states for every parameter | Frozen base + tiny grads/states |
| Quality | Highest ceiling, best for big shifts (new language, domain) | Close to full on most tasks |
| Forgetting | Higher risk | Lower (base weights untouched) |
| Storage per task | Whole model copy (14 GB for 7B in bf16) | A few MB to hundreds of MB adapter |
| Serving | One model per task | One base + swappable adapters (multi-tenant) |
| Cost / speed | High | Much cheaper, faster iteration |

**PEFT families**

- **Reparameterisation:** LoRA, QLoRA, DoRA (low-rank weight updates).
- **Additive:** adapters (small bottleneck layers inserted in each block), (IA)3.
- **Soft prompts:** prompt tuning, prefix tuning, P-tuning (learned virtual tokens).
- **Selective:** train only some layers, biases (BitFit), or norms.

**Choose**

- PEFT by default: cheap, safe, easy to version and roll back.
- Full fine-tuning when you have lots of data, a large distribution shift (new language or modality), you need the last few points of quality, or you are doing **continued pretraining**.
- Always compare on your own evaluation set\; a well-tuned LoRA often matches full fine-tuning on narrow tasks.
