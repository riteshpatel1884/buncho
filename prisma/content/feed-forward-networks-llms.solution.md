## What they are

Each Transformer block has two sublayers. Attention **moves information between positions**. The **feed-forward network** (also called the MLP) then **transforms each position independently**, with the same weights applied at every token.

Classic form:

$$\text{FFN}(x)=W_2\,\sigma(W_1x+b_1)+b_2,\qquad W_1\in\mathbb{R}^{d\times d_{ff}},\;W_2\in\mathbb{R}^{d_{ff}\times d}$$

with $d_{ff}\approx4d$ and $\sigma$ = ReLU (original) or GELU (GPT, BERT).

## Why it is needed

- **Non-linearity.** Attention is mostly a weighted average (linear in $V$ once the weights are fixed). Without an FFN, stacked layers would have little expressive power.
- **Per-token computation.** After attention gathers context, the FFN processes the enriched representation.
- **Knowledge storage.** Evidence (for example Geva et al., 2021) suggests FFN layers act like **key-value memories**: rows of $W_1$ detect patterns in the input, and the matching columns of $W_2$ write associated information to the residual stream. Much factual knowledge appears to live here.

## Modern variants

- **Gated FFN / SwiGLU** (PaLM, Llama, Mistral, Qwen):

$$\text{FFN}(x)=\big(\text{SiLU}(xW_{gate})\odot xW_{up}\big)W_{down}$$

It has **three** matrices, so $d_{ff}$ is reduced to about $\tfrac{8}{3}d$ to keep the parameter count equal. It tends to give better quality for the same compute.
- **Mixture of Experts (MoE):** replace the single FFN with many expert FFNs plus a router that sends each token to the top 1 to 2. Total parameters grow a lot, but **active parameters per token** stay small (Mixtral, DeepSeek). The FFN is where MoE is applied because it is per-token and holds most parameters.
- Bias terms are often dropped in modern LLMs.

## Size

Per layer with a classic FFN: $2\cdot d\cdot4d=8d^2$ parameters, versus $4d^2$ for attention. So the FFN holds about **two thirds of a block's parameters**, and most of its FLOPs at short context.

## Properties worth mentioning

- Position-wise: no mixing across tokens, so it parallelises trivially.
- Wrapped in a residual connection and a normalisation layer.
- Activations are often **sparse** (many neurons inactive for a given token), which is exploited by some inference optimisations.
- Fine-tuning methods such as LoRA are often applied to the FFN matrices as well as attention.
