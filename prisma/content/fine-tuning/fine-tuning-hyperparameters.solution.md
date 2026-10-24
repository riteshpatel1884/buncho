| Hyperparameter | Typical range | Notes |
|---|---|---|
| **Learning rate** | Full FT: **1e-5 to 2e-5**; LoRA/QLoRA: **1e-4 to 2e-4** | Most important knob. Too high: instability and forgetting; too low: no learning. LoRA tolerates higher LR because few weights train |
| **Epochs** | **1 to 3** | More epochs on small data memorise it; watch validation loss |
| **Batch size** | Effective **16 to 128** sequences | Use gradient accumulation to reach it; larger batches stabilise training |
| **LR schedule / warmup** | Cosine or linear decay, **3 to 10% warmup** | Warmup prevents early divergence |
| **LoRA rank r** | **8 to 64** (start 16) | Higher = more capacity and memory; diminishing returns |
| **LoRA alpha** | **r to 2r** (e.g. 16 or 32) | Scales the update ($\alpha/r$); tune together with LR |
| **LoRA dropout** | 0 to 0.1 | Mild regularisation for small datasets |
| **Target modules** | Attention only vs **all linear layers** | All-linear usually gives better quality |
| **Weight decay** | 0 to 0.1 | Light regularisation |
| **Max sequence length** | Covers your examples | Truncation silently removes answers; packing improves throughput |
| **Precision** | bf16 (or 4-bit base for QLoRA) | Prefer bf16 over fp16 for stability |

**Tuning procedure**

1. Start from the defaults above and train on a small subset to check the pipeline.
2. Sweep **learning rate first** (e.g. 5e-5, 1e-4, 2e-4), then rank/alpha, then epochs.
3. Monitor **training and validation loss** each fraction of an epoch; stop when validation loss stops improving (early stopping, keep best checkpoint).
4. Judge by **task metrics and sample outputs**, not loss alone.
5. Change one variable at a time; fix random seeds; log everything.

```python
TrainingArguments(output_dir="out", learning_rate=2e-4, num_train_epochs=2,
                  per_device_train_batch_size=4, gradient_accumulation_steps=8,   # effective 32
                  warmup_ratio=0.05, lr_scheduler_type="cosine", bf16=True,
                  eval_strategy="steps", eval_steps=100, load_best_model_at_end=True)
```
