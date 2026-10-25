**vLLM** is an open-source, high-throughput LLM inference and serving engine (from UC Berkeley's Sky Computing Lab, now a community project). Its core insight: LLM serving throughput is limited by **KV-cache memory management** and batching efficiency.

**1. PagedAttention**

- Naively, each request reserves a contiguous KV buffer for its **maximum** length, wasting memory through **fragmentation and over-reservation** (reported 60 to 80% waste in older systems), which limits batch size.
- vLLM stores the KV cache in **fixed-size blocks** (e.g. 16 tokens) allocated on demand, with a **block table** per sequence mapping logical to physical blocks (like OS virtual memory paging). A custom attention kernel reads non-contiguous blocks.
- Result: near-zero waste, more concurrent sequences, higher throughput; blocks can be **shared** (parallel sampling, beam search, common prefixes) with copy-on-write.

**2. Continuous (iteration-level) batching**

- The scheduler runs every decoding step: finished sequences leave immediately and new requests join, instead of waiting for a whole static batch. GPU stays busy; short requests do not wait for long ones.
- Handles **preemption** (swap or recompute KV) when memory runs out; supports priority and chunked prefill.

**3. Other features:** automatic **prefix caching**, chunked prefill, speculative decoding, quantisation (AWQ, GPTQ, FP8, INT8), tensor/pipeline/expert parallelism, multi-LoRA serving, structured outputs (guided decoding), multimodal models, OpenAI-compatible server, many hardware backends.

```bash
vllm serve meta-llama/Llama-3.1-8B-Instruct --max-model-len 16384 \
     --gpu-memory-utilization 0.90 --enable-prefix-caching
# OpenAI-compatible: POST /v1/chat/completions (stream=true supported)
```

**Key tuning knobs:** `gpu-memory-utilization`, `max-model-len`, `max-num-seqs`, `max-num-batched-tokens`, tensor-parallel size, quantisation, block size.

**Strengths:** high throughput, broad model/hardware support, easy deployment, active ecosystem. **Limitations:** peak per-GPU performance on NVIDIA can be below hand-optimised TensorRT-LLM engines for some models; configuration matters; Python scheduler overhead at extreme scale. Often the **default choice** to start with.
