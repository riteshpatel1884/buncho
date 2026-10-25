**Idea:** run **prefill** and **decode** on **separate GPU pools** instead of co-locating them.

```text
Request -> Router -> Prefill workers (compute-optimised, large chunks, high TP)
                         | KV cache transfer (NVLink / InfiniBand / RDMA)
                         v
                   Decode workers (memory-optimised, large batches, many concurrent sequences)
                         -> token stream to client
```

**Why it helps**

- The phases have **different bottlenecks** (compute vs memory bandwidth) and different SLOs: TTFT for prefill, inter-token latency for decode. Co-located, they **interfere** (prefill spikes stall decodes; decodes limit prefill batching).
- Separate pools allow **independent scaling and tuning**: parallelism, batch size and even GPU type per phase (compute-rich GPUs for prefill, bandwidth-rich for decode).
- Meets strict TTFT and ITL targets at the same time, increasing **goodput** (requests per second that meet both SLOs). Research systems (DistServe, Splitwise, Mooncake) report large goodput gains; production engines (vLLM, SGLang, TensorRT-LLM/Dynamo) support variants.

**Costs**

- **KV transfer:** a long prompt's KV cache can be GBs; the network must move it from prefill to decode GPUs quickly (needs high-bandwidth interconnect, layer-wise pipelined transfer), adding latency.
- More **operational complexity**: two pools, routing, capacity balancing (prefill:decode ratio), failure handling for in-flight transfers.
- Less cache sharing unless prefix caches are coordinated across nodes.

**When it pays off**

- **Long prompts** (RAG, agents, document tasks) with substantial prefill work and **strict latency SLOs**, at **large scale** (many GPUs, fast interconnect).
- Mixed workloads with high variance in prompt and output length.

**When not to bother:** short prompts, small deployments, single node, or relaxed latency targets. Try **chunked prefill** and prefix caching first; they capture much of the benefit with far less complexity.
