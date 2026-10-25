**Why it works:** LLMs generate **autoregressively**: each decode step produces one token. The server can send each token (or a small group) to the client immediately, instead of waiting for the whole answer. The first token arrives after prefill (**TTFT**), then tokens flow at the decode rate. Perceived latency drops from "total time" to "TTFT".

**Server side:** the inference engine yields tokens as they are produced (vLLM, SGLang etc. support streaming outputs); the API layer relays them as chunks.

**Transports**

| Transport | Use | Notes |
|---|---|---|
| **Server-Sent Events (SSE)** | Most LLM APIs (OpenAI, Anthropic) | One-way over HTTP, auto-reconnect, simple, works through most proxies |
| **WebSockets** | Bidirectional apps (voice, collaborative) | Needs connection management; can send interrupts upstream |
| **HTTP chunked / gRPC streaming** | Service-to-service | Efficient binary framing |

SSE example: each event is `data: {...}\n\n`, ending with `data: [DONE]`.

```python
# FastAPI relay
@app.post("/chat")
async def chat(req: Req):
    async def gen():
        async for delta in llm.stream(req.messages):
            yield f"data: {json.dumps({'t': delta})}\n\n"
        yield "data: [DONE]\n\n"
    return StreamingResponse(gen(), media_type="text/event-stream")
```

**Operational concerns**

- **Disable proxy buffering** (nginx `proxy_buffering off`, correct headers such as `Cache-Control: no-cache`, `X-Accel-Buffering: no`); keep-alive comments to survive idle timeouts.
- **Cancellation:** when the client disconnects, cancel the upstream generation to stop paying for tokens and free GPU/KV memory.
- **Backpressure:** slow clients should not exhaust server memory.
- **Guardrails:** output moderation on streams requires buffering sentences or running checks incrementally; mid-stream errors need an error event format.
- **Structured output and tool calls:** JSON arrives incrementally, so accumulate and parse after completion (or use incremental parsers); tool call arguments stream in pieces.
- **Token usage and billing** reported in a final event.
- **Frontend:** render incrementally, handle Markdown/code blocks partially received, allow stop/regenerate, retry on drops (resume or restart).

**Trade-offs:** streaming improves UX but complicates retries, caching, moderation and testing. Measure TTFT and inter-token latency, not only total latency.
