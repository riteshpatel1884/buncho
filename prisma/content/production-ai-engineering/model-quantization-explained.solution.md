**Quantization** stores and computes with **lower-precision numbers** (e.g. 8-bit or 4-bit integers/floats instead of 16-bit), shrinking memory and speeding up inference.

**Basic mapping (affine/uniform):**
$$q=\mathrm{round}\!\left(\frac{x}{s}\right)+z,\qquad \hat{x}=s\,(q-z)$$
with scale $s$ (and zero point $z$) chosen per tensor, per channel, or per **group** of weights (e.g. 128 values), where smaller groups track the local range better.

```python
import numpy as np
w = np.random.randn(4096).astype(np.float32)
s = np.abs(w).max() / 127                      # symmetric int8 scale
q = np.clip(np.round(w / s), -127, 127).astype(np.int8)
w_hat = q.astype(np.float32) * s               # dequantised
print("max error:", np.abs(w - w_hat).max())    # about s/2
```

**Benefits (7B example):** bf16 14 GB, int8 about 7 GB, 4-bit about 3.5 to 4 GB. Because decode is **memory-bandwidth-bound**, fewer bytes read per token means faster generation; smaller weights also let you fit larger models or more KV cache per GPU.

**What can be quantised:** **weights** (most common), **activations** (harder; outliers), and the **KV cache** (cuts long-context memory).

**Common formats and methods**

- **FP8** (H100 and newer): near-lossless with hardware support.
- **INT8:** LLM.int8, SmoothQuant (shifts activation outliers into weights).
- **4-bit weight-only:** GPTQ, AWQ (protect salient channels), NF4 (QLoRA), GGUF k-quants (llama.cpp).
- **Lower (2-3 bit):** research and aggressive methods (QuIP#, AQLM), noticeable quality cost.

**Trade-offs:** accuracy loss (small at 8-bit, moderate at 4-bit, large below), hardware/kernel support determines real speedups, and dequantisation overhead can offset gains for compute-bound prefill. Always **evaluate on your tasks**, not only perplexity.
