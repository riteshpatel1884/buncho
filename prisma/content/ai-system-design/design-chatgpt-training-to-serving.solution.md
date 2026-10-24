**1. Data**

- Web, books, code and licensed data; **dedupe, quality-filter, remove PII/toxicity, decontaminate** from evals; tokenizer training; data mixture weights.

**2. Pre-training (the expensive stage)**

- Decoder-only Transformer, next-token loss on trillions of tokens.
- Thousands of GPUs: **data + tensor + pipeline + (expert) parallelism**, ZeRO/FSDP sharding, bf16/fp8, FlashAttention, activation checkpointing.
- Fault tolerance: frequent checkpoints, automatic restart, straggler and failed-node handling.
- Scaling-law guided choices for model size vs tokens.

**3. Post-training**

1. **SFT** on curated instruction and chat demonstrations (chat template, system prompts, tool use).
2. **Preference optimisation:** reward model + PPO, or DPO/GRPO; **RLVR** for reasoning; safety training and red teaming data.
3. Distil into smaller, cheaper variants.

**4. Evaluation gates:** benchmarks, human preference tests, safety and jailbreak suites, regression tests, long-context and tool-use tests; block release if thresholds fail.

**5. Serving**

```text
Client -> API gateway (auth, rate limits, abuse checks) -> input safety filters
   -> Router (model choice, region, tier) -> Inference fleet
        (continuous batching, paged KV cache, prefix caching, speculative decoding,
         tensor-parallel replicas, quantised weights)
   -> output safety filters -> streaming (SSE) back to client
Conversation store, memory, tools (browse, code interpreter, retrieval) around the loop
```

- **Streaming** for perceived latency; autoscale on queue depth and KV-cache utilisation; separate **prefill and decode** capacity.
- **Context management:** conversation history truncation/summarisation, prompt caching of the shared system prompt.
- **Tools:** retrieval, code execution in sandboxes, browsing, with permission and injection defences.

**6. Safety:** input/output classifiers, policy refusals, rate limits, abuse monitoring, privacy controls and data retention rules.

**7. Feedback loop:** thumbs and preference signals, logging (with privacy controls), human review, new training data, A/B experiments, continuous model updates.

**Trade-offs:** quality vs cost (model size, reasoning effort), latency vs throughput (batch size), safety vs helpfulness, freshness (retrieval/tools) vs stored knowledge.
