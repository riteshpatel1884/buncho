**QLoRA = 4-bit quantised frozen base model + LoRA adapters trained in higher precision.** Gradients flow through the quantised weights into the adapters.

**Three ingredients**

1. **4-bit NormalFloat (NF4):** a data type designed for normally distributed weights, giving better accuracy than plain int4/fp4.
2. **Double quantisation:** also quantise the per-block quantisation constants, saving about 0.4 bits per parameter.
3. **Paged optimizers:** optimizer states spill to CPU memory during GPU memory spikes, avoiding OOM.

**How a step runs:** weights are stored in 4-bit\; each layer is **de-quantised on the fly to bf16** for the forward/backward matmul\; only the **LoRA matrices** (bf16/fp32) receive gradients and Adam states.

```python
from transformers import AutoModelForCausalLM, BitsAndBytesConfig
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
import torch
bnb = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4",
                         bnb_4bit_use_double_quant=True, bnb_4bit_compute_dtype=torch.bfloat16)
model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3.1-8B", quantization_config=bnb)
model = get_peft_model(prepare_model_for_kbit_training(model),
                       LoraConfig(r=16, lora_alpha=32, target_modules="all-linear", task_type="CAUSAL_LM"))
```

**Memory (7B model):** bf16 weights are 14 GB\; 4-bit weights are about 3.5 to 4 GB. Plus the adapter, optimizer states and activations, a 7B QLoRA run fits in roughly **6 to 10 GB**, i.e. a single 12 to 24 GB consumer GPU. Larger models (30B to 70B) fit on one 24 to 48 GB card.

**Trade-offs**

- Slower than LoRA (de-quantisation overhead), typically 20 to 40% slower.
- Slight quality loss from quantisation noise (usually small)\; the adapter partly compensates.
- Merging an adapter into a quantised base needs care: de-quantise first, merge, then re-quantise if you want a small deployable model.
