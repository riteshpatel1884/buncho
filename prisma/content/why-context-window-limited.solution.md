## Short answer

Three costs rise with sequence length $$n$$, and each is a practical limit: **attention compute grows as $$n^2$$**, **KV-cache memory grows as $$n$$ per request**, and **the model must be trained and positioned to handle long sequences**.

## 1. Quadratic attention compute

Self-attention compares every token with every other token: a $$n \times n$$ score matrix per head per layer. Doubling the length roughly quadruples that part of the compute. Naive implementations also store the matrix, so memory is $$O(n^2)$$. FlashAttention computes exact attention in tiles without storing the full matrix, which makes memory linear in $$n$$, but the number of operations is still quadratic.

## 2. KV-cache memory

During generation, every layer keeps the keys and values of all past tokens:

$$\text{KV bytes per token} = 2 \times n_{layers} \times n_{kv\_heads} \times d_{head} \times \text{bytes per value}$$

Example for a 7B-class model (32 layers, 32 KV heads of size 128, fp16):

$$2 \times 32 \times 4096 \times 2 = 524{,}288 \text{ bytes} = 0.5\text{ MiB per token}$$

| Context length | KV cache per sequence |
|---|---|
| 4,096 tokens | 2 GiB |
| 128,000 tokens | about 62.5 GiB (64,000 MiB) |

That sits on top of the weights, and it is multiplied by the number of concurrent requests, so long contexts cut the batch size and raise cost per request.

## 3. Training and positional limits

- Models are trained on sequences up to some length. Positional encodings behave unpredictably beyond what was seen.
- Long training sequences are expensive, and high-quality long-range data is scarce.
- Even when a model accepts long input, retrieval quality can degrade in the middle of the context.

## What pushes the limit

| Technique | Helps with |
|---|---|
| FlashAttention | Memory and speed of exact attention |
| Grouped-query / multi-query attention | Smaller KV cache |
| KV-cache quantisation and paging (PagedAttention) | Memory use and fragmentation |
| Sliding-window or sparse attention | Compute and memory, at the cost of direct long-range links |
| RoPE scaling (interpolation, YaRN) plus long-context fine-tuning | Extending the trained length |
| Prefix caching | Avoiding recomputation of shared prompts |

## Interview follow-up

*"Is it compute or memory that bites first in serving?"* Usually memory (the KV cache), because it limits how many long requests fit on a GPU at once.
