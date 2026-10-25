**Problem:** in continuous batching, a request with a long prompt (say 16k tokens) needs a large prefill. If the engine runs that prefill as one big step, **every decoding request in the batch waits** for it: users see a sudden pause in streaming (a spike in **inter-token latency**, so bad p99), even though their own work is tiny.

**Chunked prefill:** split the long prompt into **chunks** (e.g. 512 to 2,048 tokens). Each scheduler iteration builds a batch under a fixed **token budget**: it includes all ongoing decode tokens first, then fills the remaining budget with a chunk of the pending prefill.

```text
Without chunking:  [ ---- prefill 16k tokens ---- ] decodes stalled ...
With chunking:     [decodes + 1k prefill][decodes + 1k prefill][decodes + 1k prefill] ...
```

**Benefits**

- **Smooth inter-token latency** and much better **p95/p99** under mixed traffic (long and short prompts together).
- Better GPU utilisation: decode steps are memory-bound and leave compute idle; adding prefill chunks to the same step uses that spare compute ("piggybacking"), improving throughput.
- Keeps TTFT bounded for short requests that arrive behind a long one.

**Costs and trade-offs**

- The long request's own **TTFT increases** (its prefill is spread over several iterations).
- Slight overhead from re-reading weights and KV across chunk steps; attention for later chunks must read earlier chunks' KV.
- The **chunk size / token budget** is a tuning knob: smaller favours decode smoothness, larger favours prefill speed and total throughput.

**In practice:** supported in vLLM (`enable_chunked_prefill`, `max_num_batched_tokens`), SGLang and TensorRT-LLM. It is a first step before the heavier fix, **prefill-decode disaggregation**, which separates the phases onto different GPUs entirely.
