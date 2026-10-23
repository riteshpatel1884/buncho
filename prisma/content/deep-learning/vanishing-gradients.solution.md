**Mechanism.** By the chain rule, the gradient of the loss with respect to a weight in layer `l` of an `L`-layer network contains a product of per-layer terms:

`dL/dW_l = dL/dh_L * prod_{k=l+1..L} ( W_k^T * diag(f'(z_k)) ) * ...`

If each factor has magnitude below 1, the product shrinks exponentially with depth. Early layers receive almost no learning signal while late layers learn quickly. (If factors are above 1 you get **exploding** gradients instead.)

**Sigmoid example.** The sigmoid derivative is at most **0.25** (at 0). Ignoring weights, 20 layers give about `0.25^20 = 9 x 10^-13`. Tanh has maximum derivative 1 but saturates for large inputs, where it is near 0, so it vanishes too.

```python
import numpy as np
print(0.25 ** 20)      # 9.09e-13
```

**Fixes**

| Technique | Why it helps |
|---|---|
| **ReLU / GELU / SiLU activations** | Derivative is 1 for positive inputs, no saturation on that side |
| **Good initialisation** (Xavier for tanh, He for ReLU) | Keeps activation and gradient variance roughly constant across layers |
| **Batch / Layer normalisation** | Keeps pre-activations in a non-saturated range |
| **Residual (skip) connections** | Gradient flows through the identity path: `dL/dx = dL/dy * (1 + df/dx)` |
| **Gated units (LSTM, GRU)** | Additive cell state gives a path with near-constant gradient over time |
| **Gradient clipping** | Handles the exploding case (not vanishing) |
| **Shorter paths / auxiliary losses** | Supervise intermediate layers |

**Diagnosing:** log per-layer gradient norms; early layers several orders of magnitude smaller than late ones indicates vanishing.

**Link to Transformers:** residual connections plus layer normalisation are exactly what allow stacks of dozens or hundreds of layers to train.
