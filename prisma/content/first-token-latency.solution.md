## The short answer

The first token requires the model to **read the entire prompt** (the **prefill** phase). Every later token only needs **one new token's** worth of computation, because earlier work is stored in the **KV cache** (the **decode** phase).

## What is in the time to first token (TTFT)

1. **Network, auth and queueing.** The request may wait for a GPU slot behind others.
2. **Tokenisation and prompt assembly.**
3. **Prefill.** All $n$ prompt tokens go through every layer **in parallel**. This computes and stores $K$ and $V$ for each token. Cost grows with prompt length, and attention cost with $n^2$. Prefill is **compute-bound**: it keeps the GPU's matrix units busy.
4. **Sampling the first token** from the last position's logits.

## Why later tokens are faster

Each decode step processes **one** new token. It computes that token's $Q,K,V$, appends $K,V$ to the cache and attends over the cached keys. Per-step work is small. The step is **memory-bandwidth-bound**: the GPU must stream the weights and the KV cache from memory for a single token, so the speed is set by memory bandwidth rather than FLOPs.

| | Prefill | Decode |
|---|---|---|
| Tokens per step | Whole prompt | 1 |
| Bound by | Compute | Memory bandwidth |
| Determines | TTFT | Inter-token latency (TPOT) |
| Scales with | Prompt length | Context length and batch |

Total time is roughly:

$$\text{latency}\approx\text{TTFT}+(\text{output tokens}-1)\times\text{TPOT}$$

A 10,000-token prompt can take seconds to prefill, while each decode token may take 20 to 50 ms.

## Extra causes of a slow first token

- **Cold start:** model weights not yet loaded, or a serverless container starting up.
- **Long system prompts, many tool definitions or large retrieved context.**
- **Queueing** under load; a long prefill from another user can block short requests unless the scheduler uses chunked prefill.
- **Reasoning models** produce hidden thinking tokens first, delaying the first *visible* token.

## How to reduce it

- **Shorten the prompt**: trim context, retrieve fewer chunks, compress history.
- **Prompt (prefix) caching**: reuse the KV cache of a repeated system prompt or document.
- **Chunked prefill** and good scheduling to avoid head-of-line blocking.
- **Prefill-decode disaggregation**: separate GPU pools for each phase.
- **Smaller or quantised models**, faster hardware, tensor parallelism.
- **Streaming**: does not change TTFT, but makes the wait feel shorter once tokens start.
- Keep instances warm and place them near users.

Note that **speculative decoding** speeds up the decode phase, not the first token.
