**LLM observability** is the ability to understand **why** an LLM application behaved the way it did from its recorded telemetry: inputs, prompts, retrieved context, model calls, tool calls, outputs, costs, latency and feedback, at every step.

**Why traditional monitoring is not enough:** the system can return HTTP 200 with a wrong, unsafe or ungrounded answer. You need to inspect the intermediate steps of non-deterministic, multi-step pipelines.

**Trace structure (one trace per user request)**

```text
trace: chat_request (user, session, tenant, prompt_version, total latency, total cost)
 |- span: input_guardrails            (decision, latency)
 |- span: query_rewrite   [LLM]       (prompt, output, tokens)
 |- span: retrieval                   (query, filters, top-k ids + scores, latency)
 |- span: rerank                      (scores)
 |- span: llm_generation  [LLM]       (model, params, full prompt, output, tokens in/out, TTFT, finish_reason)
 |- span: tool_call: get_order        (args, result, error, latency)
 |- span: output_guardrails           (decision)
 '- scores: user_feedback, judge_faithfulness
```

**Implementation**

```python
from opentelemetry import trace
tracer = trace.get_tracer("rag-app")

def answer(q):
    with tracer.start_as_current_span("chat_request") as root:
        root.set_attribute("prompt.version", PROMPT_VERSION)
        with tracer.start_as_current_span("retrieval") as s:
            docs = retrieve(q); s.set_attribute("retrieval.ids", [d.id for d in docs])
        with tracer.start_as_current_span("llm_generation") as s:
            out = llm(build_prompt(q, docs)); s.set_attribute("llm.tokens_out", out.usage.completion_tokens)
        return out.text
```

- Use **OpenTelemetry** (GenAI semantic conventions) or platforms like Langfuse/LangSmith/Phoenix; propagate trace ids across services and async queues.
- **Find the failing step:** query traces by error, latency or low judge score, then view per-span timing and payloads; compare a bad trace with a good one. Step-level evals (retrieval recall, tool-call accuracy) pinpoint root causes.
- Attach **evaluation scores and user feedback to traces**, and add failing traces to a regression dataset.

**Production concerns:** redact PII before storage, sample high-volume traffic (keep all errors and flagged traces), set retention, restrict access (traces contain sensitive prompts), asynchronous export to avoid adding latency, and store prompt/model/index versions for exact reproduction.
