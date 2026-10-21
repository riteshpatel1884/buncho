## Short answer

Your message goes through an application layer that builds the full prompt, then an inference layer that runs the model in two phases (**prefill**, then token-by-token **decode**), and the tokens stream back to your screen as they are produced.

Public details of any specific product are limited, so what follows is the standard architecture of LLM chat serving.

## Step by step

1. **Client to server.** The browser sends your message over HTTPS to an API gateway that handles authentication, rate limits and abuse checks.
2. **Prompt assembly.** The backend builds the real model input: system prompt, tool definitions, memory or retrieved documents, the earlier conversation and your new message, all wrapped in the model's *chat template* with special role tokens. The model is stateless, so the whole history is sent on every turn.
3. **Safety checks.** Input classifiers or policies may run before generation, and output checks after it.
4. **Tokenisation.** Text becomes token ids.
5. **Scheduling.** A router picks a GPU replica, and a *continuous batching* scheduler groups your request with others.
6. **Prefill.** The model processes all prompt tokens in parallel and fills the **KV cache**. This is compute-bound and determines time to first token.
7. **Decode loop.** The model generates one token per step: compute logits, apply temperature / top-p sampling, append the token, reuse the KV cache. Each step is memory-bandwidth-bound.
8. **Streaming.** Tokens are detokenised and pushed to the client in small groups, typically over server-sent events, so text appears progressively.
9. **Tool calls.** If the model emits a structured tool call instead of text, the backend runs the tool, appends the result to the context and continues the loop.
10. **Stop and post-processing.** A stop token, length limit or stop sequence ends generation. Output checks, logging, usage accounting and memory updates follow.

## Where latency comes from

$$\text{total latency} \approx \underbrace{\text{queue} + \text{prefill}}_{\text{time to first token}} + \text{output tokens} \times \text{time per token}$$

## Interview follow-up

*"Why does the first token take longer than the rest?"* Prefill must process the whole prompt before anything can be emitted. Each later token only processes one new token and reuses the cache.
