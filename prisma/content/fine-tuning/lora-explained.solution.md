**Idea:** instead of updating a big weight matrix $W_0\in\mathbb{R}^{d\times k}$, **freeze** it and learn a **low-rank update**:

$$W = W_0 + \frac{\alpha}{r}\,BA,\qquad B\in\mathbb{R}^{d\times r},\; A\in\mathbb{R}^{r\times k},\; r\ll\min(d,k)$$

The hypothesis: the change needed to adapt a pretrained model has **low intrinsic rank**.

**Parameter saving:** a $4096\times4096$ matrix has 16.8M weights\; with $r=8$, LoRA trains $2\times4096\times8=65{,}536$ (about 0.4%). For Llama-style 7B with $r=16$ on all linear layers that is about **40M trainable parameters (~0.6%)**.

**Details**

- **Init:** $A$ random (Gaussian), $B=0$, so $\Delta W=0$ at the start and training begins exactly at the pretrained model.
- **Scaling** $\alpha/r$ controls update magnitude\; common choice $\alpha=r$ or $2r$.
- **Targets:** originally attention `q_proj`, `v_proj`\; modern practice applies to **all linear layers** (attention + MLP) for better quality.
- Only $A,B$ get gradients and Adam states, so memory drops sharply.

```python
from peft import LoraConfig, get_peft_model
cfg = LoraConfig(r=16, lora_alpha=32, lora_dropout=0.05,
                 target_modules=["q_proj","k_proj","v_proj","o_proj","gate_proj","up_proj","down_proj"],
                 task_type="CAUSAL_LM")
model = get_peft_model(base_model, cfg)
model.print_trainable_parameters()
```

**Inference:** merge for **zero extra latency**: $W\leftarrow W_0+\frac{\alpha}{r}BA$ (or keep adapters separate to hot-swap many tasks on one base).

```python
import numpy as np
d,k,r,alpha = 64,48,4,8
W0, A, B = np.random.randn(d,k), np.random.randn(r,k)*0.01, np.random.randn(d,r)
x = np.random.randn(5,d)
assert np.allclose(x@W0 + (alpha/r)*(x@B)@A, x@(W0 + (alpha/r)*B@A))   # merged == unmerged
```

**Trade-offs:** very large domain shifts may need higher rank or full fine-tuning\; rank is a hyperparameter (8 to 64 typical)\; variants include DoRA, LoRA+, rsLoRA.
