*Exact internals of proprietary products are not public. This is the standard architecture of a production LLM chat system.*

## 1. Application layer

1. **Request and auth.** The client sends the message over HTTPS to an API gateway, which authenticates, applies **rate limits** and quota checks, and routes to a region.
2. **Input safety.** Moderation and policy classifiers check the input.
3. **Prompt assembly.** The server builds the full model input: system prompt, tool definitions, retrieved or remembered context, prior conversation turns (truncated or summarised to fit the **context window**) and the new message, all formatted with the model's **chat template** (special role tokens).
4. **Tokenisation.** The text is converted to token IDs.

## 2. Serving layer

5. **Scheduling.** The request joins a queue. A **continuous-batching** scheduler (as in vLLM-style engines) merges it with other in-flight requests on the same GPUs. Shared prompt prefixes may be served from a **prefix/prompt cache**.
6. **Prefill.** All prompt tokens are processed in **one parallel forward pass**. This is **compute-bound**, it fills the **KV cache**, and it determines **time to first token (TTFT)**.
7. **Decode loop.** Now one token is produced per step. Each step reads the weights and the KV cache, so it is **memory-bandwidth-bound**. The logits go through temperature, top-p and penalties, and a token is sampled and appended.
8. **Stopping.** Generation ends on an end-of-turn token, a stop sequence or a max-token limit.

## 3. Return path

9. **Streaming.** Tokens are detokenised and pushed to the browser incrementally (Server-Sent Events), which is why text appears word by word.
10. **Output safety and tools.** Output filters run; if the model emitted a tool call, the platform executes the tool and feeds the result back for another generation round.
11. **Persistence.** The conversation is stored, and usage is metered for billing and monitoring.

## Why this matters

- **TTFT** is driven by prompt length and queueing; **inter-token latency** is driven by memory bandwidth and batch size.
- Long histories raise cost and latency, so systems compact or cache context.
- The **model is stateless**: "memory" of the chat exists only because the application re-sends the history every turn.
