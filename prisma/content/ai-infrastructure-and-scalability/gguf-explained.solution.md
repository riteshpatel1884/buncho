**GGUF (GPT-Generated Unified Format)** is the **single-file model format of llama.cpp** (successor to GGML/GGJT) designed for fast loading and inference on CPUs, Apple Silicon and GPUs.

**File layout**

```text
magic "GGUF" | version | tensor_count | metadata_kv_count
metadata key-values:  architecture, context length, head counts, rope params,
                      tokenizer (vocab, merges, special tokens), chat template, quantisation info
tensor info:          name, shape, ggml type (F16, Q8_0, Q4_K, ...), data offset
[alignment padding]
tensor data:          contiguous, aligned binary blobs
```

**Why it works well**

- **Self-contained:** weights, tokenizer, hyper-parameters and chat template all in one file, with no external config files.
- **Memory-mappable (`mmap`):** aligned tensor data is mapped directly into memory, so load is near-instant and the OS pages weights in lazily and shares them between processes.
- **Extensible key-value metadata** without breaking old readers; supports many architectures.
- **Quantised tensor types** stored in blocks.

**Quantisation types**

| Family | Idea |
|---|---|
| **Q8_0, Q4_0, Q4_1, Q5_0...** | Blocks of 32 weights share one scale (and min): simple |
| **K-quants (Q2_K to Q6_K, e.g. Q4_K_M, Q5_K_M)** | Super-blocks (256 weights) split into sub-blocks with their own quantised scales/mins; **mixed precision** per tensor (the "_M"/"_S"/"_L" suffix picks which sensitive tensors, like attention V or output, keep higher bits) |
| **I-quants (IQ2/IQ3/IQ4)** | Codebook/lattice style for very low bits, usually need an **importance matrix (imatrix)** calibrated on sample text |
| **F16/BF16/F32** | Unquantised |

Effective bits: Q4_K_M ≈ 4.8 bpw, Q5_K_M ≈ 5.7, Q6_K ≈ 6.6, Q8_0 ≈ 8.5.

**Choosing:** Q4_K_M is the common size/quality sweet spot (~4x smaller than FP16, small perplexity increase); Q5_K_M/Q6_K for quality; IQ2/IQ3 only when memory-bound and with imatrix. Check perplexity/benchmarks on your task.

```bash
python convert_hf_to_gguf.py ./model --outfile model-f16.gguf
llama-quantize model-f16.gguf model-Q4_K_M.gguf Q4_K_M
llama-cli -m model-Q4_K_M.gguf -p "Hello" -ngl 35     # offload 35 layers to GPU
```

Supports **partial GPU offload**, CPU SIMD kernels (AVX2/NEON), Metal, CUDA, Vulkan; ecosystem: llama.cpp, Ollama, LM Studio.
