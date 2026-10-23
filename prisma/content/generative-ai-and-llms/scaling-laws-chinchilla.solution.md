**Scaling laws:** test loss falls as a smooth **power law** in model parameters `N`, training tokens `D` and compute `C`, over many orders of magnitude (Kaplan et al., 2020).

**Compute rule of thumb:** `C ~ 6 * N * D` FLOPs.

**Chinchilla (Hoffmann et al., 2022):** earlier models were *under-trained*: too many parameters for too few tokens. For a fixed compute budget, the optimum scales `N` and `D` **together**, at roughly **20 training tokens per parameter**. A 70B model (Chinchilla) trained on 1.4T tokens beat the 280B Gopher trained on 300B tokens, using the same compute.

```python
def chinchilla_optimal(compute_flops):
    # C = 6*N*D and D = 20*N  ->  N = sqrt(C / 120)
    N = (compute_flops / 120) ** 0.5
    return N, 20 * N
print(chinchilla_optimal(5.76e23))   # about (7e10, 1.4e12)
```

**Why practice deviates**

- **Inference cost:** a smaller model trained far beyond 20 tokens/parameter is cheaper to serve, so labs "over-train" (Llama 3 8B saw about 15T tokens, about 1,900 tokens per parameter).
- Data quality, repetition limits and data running out change the optimum.
- Capabilities do not always scale smoothly even if loss does.

**Use in decisions:** budget compute, choose model size and token count, extrapolate from small pilot runs, and decide whether to train longer or scale up.
