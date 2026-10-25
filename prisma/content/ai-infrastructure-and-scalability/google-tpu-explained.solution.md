**TPU (Tensor Processing Unit)** is Google's **ASIC for neural network matrix math**, used for Search, Translate, Gemini and available via Google Cloud.

**Core design**

- **Matrix Multiply Unit (MXU):** a large **systolic array** (e.g. 128x128 multiply-accumulate cells; 256x256 on newer generations). Operands flow through the grid cell to cell so each loaded value is reused many times and intermediate results never return to memory, giving very high FLOPs per byte and energy efficiency.
- **Vector and scalar units** for elementwise ops, activations, control; **SparseCores** for embedding lookups (recommendation).
- **On-chip memory:** large unified buffers/CMEM and **HBM** for weights and activations.
- **bfloat16** was popularised by TPUs (FP32 range, lower precision); newer chips add INT8/FP8.
- **Inter-Chip Interconnect (ICI):** chips are wired in a **2D/3D torus** with direct high-bandwidth links, forming **pods** of hundreds to thousands of chips (plus optical circuit switches for reconfiguration) so large models shard with fast collectives without a conventional network.

**Software:** programmed via **XLA** compiler (from JAX, TensorFlow, PyTorch/XLA). The compiler fuses ops and schedules statically across the array and the pod (GSPMD for sharding), so execution is deterministic and heavily optimised, but dynamic shapes and custom kernels are harder than on GPUs (Pallas offers kernel authoring).

**Generations (approx.):** v2/v3 (training, liquid cooling), v4 (3D torus, OCS), v5e (cost-efficient inference), v5p (large training), v6e "Trillium", and Ironwood (v7, inference focus).

| | GPU | TPU |
|---|---|---|
| Flexibility | General-purpose, CUDA ecosystem | Specialised for dense tensor workloads |
| Scaling | NVLink + InfiniBand clusters | Torus ICI pods, compiler-managed |
| Programming | CUDA/Triton, dynamic | XLA/JAX, static graphs |
| Availability | Everywhere | Mainly Google Cloud |

**When to use:** large-scale training/inference in JAX/XLA stacks, cost efficiency at scale; GPUs when you need the broadest software support.
