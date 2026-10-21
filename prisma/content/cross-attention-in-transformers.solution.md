## Definition

**Cross-attention** is attention where the **queries come from one sequence and the keys and values come from a different sequence**. It lets one stream of representations *read from* another.

| | Queries from | Keys and values from |
|---|---|---|
| Self-attention | Sequence A | Sequence A |
| Cross-attention | Sequence A (target) | Sequence B (source or context) |

## Computation

Let the decoder states be $X_{dec}\in\mathbb{R}^{T_{dec}\times d}$ and the encoder output be $H_{enc}\in\mathbb{R}^{T_{enc}\times d}$:

$$Q=X_{dec}W_Q,\qquad K=H_{enc}W_K,\qquad V=H_{enc}W_V$$

$$\text{CrossAttn}=\text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V$$

- Score matrix shape: $T_{dec}\times T_{enc}$. The two lengths **can differ**.
- Output shape: $T_{dec}\times d$, so each decoder position receives a summary of the source.
- **No causal mask** is applied, because the whole source is available. Padding masks are still used.
- $K$ and $V$ depend only on the encoder output, so they are computed **once** and reused for every decoding step.

## Where it is used

- **Original Transformer and T5/BART:** each decoder layer has masked self-attention, then cross-attention to the encoder output, then an FFN. Example: while generating the French word for "cat", the decoder attends to the English "cat".
- **Whisper:** the text decoder cross-attends to audio encoder features.
- **Stable Diffusion and other diffusion models:** image latents (queries) cross-attend to **text embeddings** (keys and values), which is how a prompt steers the image.
- **Vision-language models** (for example Flamingo-style designs): language tokens attend to visual features.
- **Retrieval-augmented architectures** (RETRO): the model cross-attends to retrieved chunks.

## What decoder-only LLMs do instead

GPT-style models have **no cross-attention**. Context such as an instruction, document or retrieved passage is simply **placed in the same sequence** as the prompt, and ordinary causal self-attention handles it. Multimodal decoder-only models usually project image features into token embeddings and put them in that same sequence.

## Trade-offs

- Cross-attention keeps the source in a separate, cleanly encoded stream and lets the source length differ from the target's.
- It adds parameters and a separate pathway; concatenating context into one sequence is simpler and scales well with large pre-training, but pays full self-attention cost over the combined length.
