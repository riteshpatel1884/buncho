**TensorRT-LLM** is NVIDIA's open-source library for optimised LLM inference on NVIDIA GPUs. It builds on **TensorRT** (graph compiler) and adds LLM-specific runtime features.

**Workflow**

```text
Hugging Face checkpoint -> convert (weights, quantisation: FP8/INT4 AWQ/GPTQ/SmoothQuant, parallel sharding)
   -> build engine (trtllm-build: kernel fusion, autotuned kernels, plugins, fixed max shapes/batch/seq)
   -> serve (Triton Inference Server / trtllm-serve / NVIDIA NIM) with in-flight batching
```

**Key optimisations**

- **Ahead-of-time compilation:** fuses operations, picks the fastest kernels for the specific GPU and shapes; hand-tuned **attention kernels** (FlashAttention-style, paged KV cache).
- **In-flight (continuous) batching** and **paged KV cache**, chunked prefill, KV cache reuse/offloading.
- **Quantisation:** FP8 and FP4 on Hopper/Blackwell hardware, INT8/INT4 weight-only, KV-cache quantisation.
- **Parallelism:** tensor, pipeline, expert (MoE) and multi-node; **speculative decoding** (draft model, Medusa, EAGLE), disaggregated serving through NVIDIA Dynamo.
- Tight integration with CUDA, NCCL, NVLink and new GPU features.

**Strengths:** typically the **highest throughput and lowest latency on NVIDIA GPUs**, especially with FP8 on H100/B200, at large scale and for stable, high-volume models.

**Trade-offs**

- **NVIDIA-only**, build step per model/GPU/config (engines are not portable), longer iteration cycles.
- Newer models and features may land later than in vLLM/SGLang; debugging compiled engines is harder.
- Fixed upper bounds on shapes at build time.
- More operational complexity (engine management, Triton config), though NIM containers simplify deployment.

**Use when:** you serve a **stable model at large scale on NVIDIA GPUs** and every percent of throughput or latency has material cost value; start with vLLM/SGLang for flexibility and move to TensorRT-LLM when the workload is mature.
