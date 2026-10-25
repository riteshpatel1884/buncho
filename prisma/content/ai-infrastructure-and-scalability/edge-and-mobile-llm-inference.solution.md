**Constraints:** limited RAM (4 to 16 GB shared with the OS), low memory bandwidth (phones 30 to 100 GB/s vs 3,000 on H100), thermal throttling, battery, storage and app-size limits, heterogeneous accelerators (CPU/GPU/NPU).

**Optimisation levers**

1. **Right-size the model:** 0.5B to 4B parameters (Gemma, Phi, Qwen, Llama 3.2 1B/3B, SmolLM); **distil** from a larger model; task-specific fine-tuning; MoE with few active parameters.
2. **Quantise:** **4-bit weights** (Q4_K_M GGUF, AWQ/GPTQ, QAT-trained int4), 8-bit activations where supported; quantise the **KV cache** (int8/int4); keep embeddings/outputs higher precision; evaluate quality on-task.
3. **Runtimes and formats:** llama.cpp/GGUF, **MLC-LLM** (TVM), **ExecuTorch**, MediaPipe LLM Inference, Core ML / MLX (Apple), ONNX Runtime (DirectML/QNN), TensorFlow Lite/LiteRT, Qualcomm AI Engine, MediaTek NeuroPilot, WebGPU/WebLLM in browsers.
4. **Use accelerators:** NPU/GPU kernels for matmul; fall back to CPU SIMD (NEON/AVX2) where unsupported; balance partial offload against memory copies.
5. **Memory management:** mmap weights, shared memory, limit context (2k to 8k), sliding-window/GQA models, KV-cache compression/eviction, avoid fragmentation; load/unload models on demand.
6. **Decoding speed:** speculative decoding with a tiny draft model, prompt caching of system prompts across sessions, shorter outputs, constrained decoding for structured results, streaming tokens.
7. **Power/thermal:** limit threads, batch background work, adaptive precision/length, monitor temperature.
8. **Delivery:** model download on demand, delta updates, versioning, integrity checks, A/B rollouts.
9. **Hybrid architecture:** small on-device model handles private/fast/offline tasks; **route to cloud** for hard queries (confidence/length-based router); fall back gracefully offline.
10. **Privacy/security:** data stays on device, protect weights (encryption), guard against prompt injection from local content.

**Measure:** time-to-first-token, tokens/s, peak RAM, energy per token (mAh), thermal behaviour over sustained use, and task quality vs the cloud model. Typical targets: 10 to 30 tok/s for 1 to 3B Q4 models on flagship phones.
