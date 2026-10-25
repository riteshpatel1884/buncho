**llama.cpp** is a dependency-light C/C++ inference engine (built on the **ggml** tensor library) created to run LLMs on laptops, phones and servers without Python, PyTorch or a big GPU.

**What makes it work**

1. **Quantisation:** weights are stored in compact formats (Q8_0, Q6_K, **Q4_K_M**, Q3_K, Q2_K, IQ-series). A 7B model drops from 14 GB (fp16) to about 4 to 5 GB at 4-bit, which fits ordinary RAM. Quality loss is small at 4 to 5 bits and grows below.
2. **GGUF file format:** a single self-contained file with weights, tokenizer, hyperparameters and chat template metadata; supports memory mapping.
3. **Memory mapping (`mmap`):** weights are mapped from disk so loading is near-instant and the OS pages them in on demand and shares them across processes.
4. **Optimised CPU kernels:** SIMD (AVX2/AVX-512, ARM NEON), multi-threading, and low-bit integer matrix routines; decode is memory-bandwidth-bound, so smaller weights are directly faster.
5. **Many backends:** Apple **Metal** (unified memory is excellent for LLMs), CUDA, ROCm/HIP, Vulkan, SYCL, OpenCL, with **partial GPU offload** (`-ngl N` layers on the GPU, the rest on CPU) so models bigger than VRAM still run.
6. **Runtime features:** KV cache (optionally quantised), continuous batching in the server, speculative decoding, grammar-constrained (GBNF/JSON schema) sampling, LoRA adapters, embeddings, multimodal models.

```bash
llama-cli -m Llama-3.1-8B-Instruct-Q4_K_M.gguf -p "Explain RAG" -c 8192 -ngl 99
llama-server -m model.gguf --port 8080       # OpenAI-compatible HTTP API
```

**Rough memory rule:** GGUF file size + KV cache (grows with context length) + overhead.

**Strengths:** runs almost anywhere, privacy and offline use, easy to embed, huge model support. **Limitations:** lower throughput than vLLM/TensorRT-LLM for many concurrent users on server GPUs; single-node focus; quantised accuracy loss; fewer enterprise serving features. It underpins tools such as Ollama and LM Studio.
