**LPU** is Groq's inference chip (Tensor Streaming Processor architecture) built around the observation that LLM **decode is memory-bandwidth-bound**.

**Key design choices**

1. **SRAM as primary weight memory:** instead of off-chip HBM (3 to 8 TB/s), each chip has hundreds of MB of on-chip SRAM with on the order of **tens of TB/s** bandwidth. Weights are read at far higher speed, so tokens/s per request can be much higher.
2. **Deterministic, statically scheduled execution:** the **compiler** plans every instruction and data movement cycle by cycle across the whole system. No caches, arbitration, or dynamic scheduling, so latency is predictable (no tail jitter) and utilisation is high.
3. **Dataflow/streaming architecture:** functional slices (matrix, vector, switch, memory) are arranged so data streams through them like an assembly line.
4. **Chip-to-chip scale-out:** a model is **sharded across many chips** (hundreds for a 70B model) connected in a synchronous network, effectively acting as one large deterministic pipeline.

**Consequences**

| Pros | Cons |
|---|---|
| Very low latency and high tokens/s per user (hundreds of tokens/s for 70B-class models) | Small capacity per chip (about 230 MB), so many chips and racks per model; high capex/footprint |
| Predictable latency, good for real-time/voice agents | Best for batch-1/low-batch latency; per-token efficiency at high batch is less compelling than GPUs |
| Efficient low-precision inference | Less flexible: model support depends on the compiler; not for training |

**Comparison:** GPU = flexible, HBM-based, dynamic scheduling; TPU = systolic arrays with compiler-managed pods; LPU = SRAM-resident weights with compile-time determinism, optimised purely for inference speed. Related approaches: Cerebras (wafer-scale SRAM), SambaNova.

**Takeaway:** it attacks the same bottleneck as quantisation and speculative decoding but in hardware: **move weights faster**.
