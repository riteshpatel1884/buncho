| | **vLLM** | **SGLang** | **TensorRT-LLM** | **llama.cpp / Ollama** |
|---|---|---|---|---|
| Core strength | General-purpose, PagedAttention, huge model/hardware support | Prefix reuse (RadixAttention), fast structured output, agent workloads | Peak NVIDIA performance via compiled engines, FP8/FP4 | Runs anywhere, CPU/Apple/consumer GPUs, GGUF |
| Hardware | NVIDIA, AMD, TPU, CPU and more | NVIDIA, AMD, others | **NVIDIA only** | CPU, Metal, CUDA, Vulkan, ROCm |
| Setup effort | Low (`vllm serve`) | Low to medium | **Highest** (engine builds) | Lowest |
| New-model support | Fast | Fast | Slower | Fast for popular models |
| Concurrency/scale | Excellent | Excellent | Excellent (best at scale) | Limited |
| Best for | Default production serving, many models/adapters | RAG, agents, multi-turn, JSON/grammar outputs, MoE at scale | Stable high-volume NVIDIA deployments | Local/edge/dev, privacy |

**Decision guide**

1. **Prototype or local, single user, laptop/edge:** Ollama or llama.cpp.
2. **Production serving, want flexibility and easy ops:** **vLLM** (the safe default).
3. **Workload with lots of shared prefixes** (long system prompts, RAG over the same documents, multi-turn agents, branching) **or heavy structured output:** try **SGLang**; benchmark against vLLM.
4. **Very large, stable deployment on NVIDIA where every percent of cost matters:** **TensorRT-LLM** (often via NVIDIA NIM/Dynamo), accepting build complexity.
5. **Non-NVIDIA hardware:** vLLM or SGLang (AMD), llama.cpp, vendor stacks.

**Evaluate rather than assume:** benchmark with **your** model, hardware, prompt/output length distribution and SLOs; measure TTFT, inter-token latency, throughput, cost per million tokens and quality after quantisation. Engines evolve quickly and converge on features (all support continuous batching, prefix caching, speculative decoding, quantisation), so operational fit (team skills, observability, deployment tooling, model support) often decides.

**Hedge:** keep an OpenAI-compatible interface so engines can be swapped behind your gateway.
