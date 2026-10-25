**First diagnose:** measure TTFT, TPOT, throughput, GPU utilisation and queue time. **Prefill is compute-bound; decode is memory-bandwidth-bound**, so most tricks either move fewer bytes per token or amortise weight reads across more tokens.

| Layer | Technique | Helps |
|---|---|---|
| **Model** | **Quantisation** (FP8/INT8/INT4 AWQ/GPTQ, KV-cache quantisation) | Fewer bytes per weight: faster decode, more KV space |
| | Distillation, smaller/specialised model, MoE, pruning | Fewer FLOPs/bytes |
| | GQA/MQA, sliding-window attention, MLA | Smaller KV cache |
| **Kernels** | FlashAttention, fused kernels, CUDA graphs, torch.compile, TensorRT-LLM | Less memory traffic and launch overhead |
| **Memory** | **PagedAttention** (no fragmentation), prefix/prompt caching, KV offload | Higher batch sizes, skip repeated prefill |
| **Scheduling** | **Continuous batching**, chunked prefill, prefill-decode disaggregation, priority queues | Throughput and tail latency |
| **Decoding** | **Speculative decoding** (draft model, Medusa, EAGLE, n-gram), multi-token prediction | Lower TPOT at low batch |
| **Parallelism** | Tensor parallel for latency and fit, pipeline/expert parallel for scale, data-parallel replicas for throughput | Fit and scale |
| **Prompt/product** | Shorter prompts, cap max tokens, structured output, streaming, caching, routing easy queries to small models | Fewer tokens to compute |
| **Hardware/system** | Right GPU (bandwidth and memory), NVLink, co-location, warm pools, autoscaling | Capacity and cost |

**Order of attack (typical)**

1. Use a modern engine (vLLM, SGLang, TensorRT-LLM) with continuous batching + PagedAttention.
2. Quantise (FP8 on H100, INT4 AWQ otherwise) and validate quality.
3. Enable prefix caching and chunked prefill; tune `max_num_seqs` and token budget.
4. Add speculative decoding for latency-sensitive low-batch traffic.
5. Optimise prompts/outputs and route by complexity.
6. Scale out with replicas; use TP only as needed to fit or cut latency.

**Rule of thumb:** latency goals (TTFT/TPOT) and throughput goals pull in opposite directions, so state your SLO first and verify each change with a load test on realistic prompts. Always re-run quality evals after quantisation or speculative changes.
