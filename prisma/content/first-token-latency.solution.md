## Short answer

Time to first token (TTFT) includes **queueing and prefill**: the model must process the *entire prompt* before it can emit anything. After that, each new token needs only one cheap step that reuses cached state, so tokens arrive at a steady pace.

## The two phases

| | Prefill | Decode |
|---|---|---|
| Work | Process all $$n$$ prompt tokens in parallel; build the KV cache | Process 1 new token per step; append to the cache |
| Limited by | **Compute** (large matrix multiplications keep the GPU busy) | **Memory bandwidth** (each step reads all the weights and the KV cache for a tiny amount of math) |
| Scales with | Prompt length | Number of output tokens |
| Visible as | TTFT | Time per output token (TPOT) |

Rough prefill cost: about $$2 \times P \times n$$ floating-point operations for $$P$$ parameters and $$n$$ prompt tokens, plus the attention term that grows with $$n^2$$. For a 7B model and a 2,000-token prompt that is about $$2.8\times10^{13}$$ operations, a noticeable fraction of a second even on a fast GPU.

Rough decode cost: every step streams the weights from GPU memory. A 7B model in fp16 is about 14 GB, so at about 2 TB/s of bandwidth one step takes on the order of 7 ms for a single request. Each step is far cheaper than prefill, but there are many of them.

## Other contributors to TTFT

- Waiting in the request queue or for a batch slot
- Cold starts and model loading on autoscaled or serverless deployments
- Network round trip and gateway processing
- Retrieval, tool calls and safety checks before generation starts

## How to reduce it

| Technique | Effect |
|---|---|
| Shorter prompts, less retrieved context | Less prefill work |
| **Prompt / prefix caching** | Reuse the KV cache of a shared prefix (system prompt, documents) |
| Chunked prefill | Stops long prompts from blocking other requests |
| Prefill–decode disaggregation | Separate GPU pools tuned for each phase |
| Quantisation, faster hardware, tensor parallelism | Faster prefill |
| Warm replicas, smarter autoscaling | Removes cold-start and queueing delay |
| Streaming | Does not reduce TTFT, but makes the wait feel shorter once tokens start |

Speculative decoding speeds up the **decode** phase, not TTFT.

## Interview follow-up

*"Which metric would you watch for a chat UI and which for batch jobs?"* Chat: TTFT and TPOT. Batch: total throughput (tokens per second per GPU) and cost per token.
