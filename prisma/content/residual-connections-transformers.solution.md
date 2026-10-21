## Definition

A **residual (skip) connection** adds a sublayer's **input** to its **output**:

$$y=x+F(x)$$

Each Transformer block has two of them, one around attention and one around the feed-forward network:

$$h\leftarrow h+\text{Attn}(\text{Norm}(h)),\qquad h\leftarrow h+\text{FFN}(\text{Norm}(h))$$

The idea comes from ResNets (He et al., 2015). The sublayer only has to learn a **correction** to its input, not a whole new representation.

## Why they matter

**1. Gradient flow.** Differentiate $y=x+F(x)$:

$$\frac{\partial y}{\partial x}=I+\frac{\partial F}{\partial x}$$

The identity term $I$ gives gradients a **direct path** from the loss back through every layer. Even if $\partial F/\partial x$ is tiny, the gradient does not vanish, so 80+ layer models can be trained. Without skips, the gradient would be a long product of Jacobians that can shrink or explode.

**2. Easy to learn identity.** If a layer is not useful, $F\to0$ and the layer passes information through. Adding depth therefore rarely hurts optimisation.

**3. Preserves information.** The original token embedding and early features stay available to later layers instead of being overwritten.

**4. The residual stream view.** Interpretability work treats the vector $h$ as a shared **communication channel**: each attention head and FFN reads from it and **writes an update** back by addition. The final hidden state is the embedding plus the sum of all layer contributions. This is why the "logit lens" can read predictions out of intermediate layers.

## Interaction with normalisation

- **Post-norm** (original): $y=\text{Norm}(x+F(x))$. The norm sits on the main path, which can make very deep models unstable and need careful warm-up.
- **Pre-norm** (GPT-2 onward, Llama): $y=x+F(\text{Norm}(x))$. The main path stays a clean identity, so gradients flow undisturbed and training is more stable. This is why modern LLMs use pre-norm, usually with RMSNorm, plus a final norm before the output head.
- Pre-norm lets the residual stream's magnitude grow with depth, so some models use scaled initialisation of output projections (for example $1/\sqrt{2N}$) to keep it controlled.

## Practical points

- Dimensions must match: sublayer output has the same width $d$ as its input (that is why attention ends with $W_O$ and the FFN projects back to $d$).
- Residuals add **no parameters** and almost no compute.
- **Dropout**, if used, is applied to the sublayer output before the addition.
- In memory terms, the residual stream must be kept during the forward pass for the backward pass, which is part of why activation checkpointing is used.
