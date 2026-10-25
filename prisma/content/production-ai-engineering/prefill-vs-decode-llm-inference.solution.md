**Prefill (processing the prompt)**

- All $P$ prompt tokens are processed **in parallel** in one forward pass, producing the KV cache and the first output token.
- The weights are read once but used for $P$ tokens: large matrix-matrix multiplications with high **arithmetic intensity** (FLOPs per byte moved). The GPU's compute units are the limit: **compute-bound**.
- Determines **time to first token (TTFT)**; cost grows with prompt length (and quadratically in attention).

**Decode (generating the answer)**

- Tokens are produced **one at a time** per sequence, each needing the previous token. Each step multiplies the new token's vector with every weight matrix: matrix-vector work.
- Every step must **stream all model weights** (plus the sequence's KV cache) from GPU memory for a tiny amount of arithmetic: low arithmetic intensity, so it is **memory-bandwidth-bound**.
- Determines **inter-token latency (ITL)** and throughput per sequence.

**Worked example (7B model, bf16, H100-class GPU)**

- Weights = 14 GB; memory bandwidth about 3.35 TB/s, so one decode step at batch size 1 takes at least 14 / 3350 s, about **4.2 ms**, so at most roughly 240 tokens/s regardless of how many FLOPs the GPU has.
- Compute at batch 1 is about 2 FLOPs per parameter per token, 14 GFLOPs, taking microseconds on a GPU that does about 1,000 TFLOPs: the GPU is almost idle. The "ridge point" (FLOPs/byte needed to saturate compute) is a few hundred; decode at batch 1 has intensity of about 1.

**Consequences**

| Phase | Bottleneck | Optimisations |
|---|---|---|
| Prefill | Compute | Faster GPUs/FP8, FlashAttention, prefix caching, chunked prefill, tensor parallelism |
| Decode | Memory bandwidth | **Batching** many sequences (reuses each weight read), quantisation (fewer bytes per weight), GQA/MQA and KV quantisation, speculative decoding, paged KV cache |

**Why batching matters:** batching $B$ sequences in decode reads weights once for $B$ tokens, raising intensity roughly $B$-fold, so throughput scales almost linearly until compute or KV memory becomes the limit. This is why **continuous batching** is central to serving engines.

Because the two phases stress different resources, they interfere when mixed on the same GPU, motivating **chunked prefill** and **prefill-decode disaggregation**.
