**CPU vs GPU:** a CPU has a few powerful cores optimised for low latency on serial work; a GPU has **thousands of simpler cores** optimised for **throughput on massively parallel, data-parallel work**. Neural networks are dominated by matrix multiplications and elementwise ops that are exactly that.

**Architecture (NVIDIA terms)**

- **Streaming Multiprocessors (SMs):** the GPU has ~100+ SMs (H100: 132). Each has CUDA cores, **tensor cores**, registers, shared memory/L1, and warp schedulers.
- **Threads, warps, blocks, grid:** threads run in groups of 32 (**warps**) executing the same instruction (SIMT). Blocks of threads are scheduled on an SM; many warps per SM hide memory latency by switching while others wait.
- **Tensor cores:** dedicated units doing small matrix multiply-accumulate (e.g. 16x16 tiles) in low precision (FP16/BF16/FP8/FP4) with FP32 accumulation, giving an order of magnitude more FLOPs than CUDA cores.
- **Memory hierarchy (fast/small to slow/large):** registers → shared memory/L1 (about 200+ KB/SM, ~20+ TB/s aggregate) → L2 (tens of MB) → **HBM** (80 to 192 GB, 2 to 8 TB/s) → host memory over PCIe/NVLink.
- **Interconnect:** NVLink/NVSwitch for GPU-to-GPU traffic (up to ~900 GB/s on H100), InfiniBand/Ethernet between nodes.

**Why it fits deep learning**

- Matmul $C = AB$ has high **arithmetic intensity** when tiled: load tiles into shared memory, reuse across many multiply-adds, use tensor cores.
- Training and batched inference expose abundant parallelism (batch, sequence, heads, hidden dimension).
- Mixed precision doubles/quadruples throughput and halves memory.

**Performance model (roofline):** a kernel is **compute-bound** if FLOPs/byte exceeds peak FLOPs / peak bandwidth (H100 ridge ≈ 300 FLOP/byte in BF16) and **memory-bound** otherwise. LLM decode, layer norms, softmax, and elementwise ops are memory-bound; large matmuls and prefill are compute-bound.

**Practical consequences:** fuse operations to avoid round trips to HBM (FlashAttention), use large enough batches, keep tensors contiguous and aligned (multiples of 8/16 for tensor cores), overlap compute and communication, and avoid CPU-GPU synchronisation.
