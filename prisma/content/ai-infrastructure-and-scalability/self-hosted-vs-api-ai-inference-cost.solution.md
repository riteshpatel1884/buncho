**API pricing:** pay per token (input/output), no idle cost, instant scale, frontier models, zero ops. **Self-hosting:** pay for GPU-hours (or hardware) regardless of use, you provide capacity, reliability and tuning.

**Break-even math**

```python
def self_host_cost_per_mtok(gpu_hourly, n_gpus, tokens_per_sec_total, utilisation):
    tokens_per_hour = tokens_per_sec_total * 3600 * utilisation
    return gpu_hourly * n_gpus / tokens_per_hour * 1e6

# e.g. 2xH100 at $3/h each serving a 70B FP8 model at 3,000 tok/s aggregate, 50% utilisation:
print(self_host_cost_per_mtok(3, 2, 3000, 0.5))     # about $1.1 per million output tokens
```

If an API charges more per million tokens than this effective cost, self-hosting wins **only if you keep utilisation high**. At 10% utilisation the same cluster costs about 5x more per token.

| Factor | **API** | **Self-hosted** |
|---|---|---|
| Cost at low/variable volume | Better (no idle) | Worse (idle GPUs) |
| Cost at high steady volume | Can be expensive | Often 2 to 10x cheaper per token with open models |
| Model quality | Frontier proprietary models | Open weights (good and improving, usually slightly behind frontier) |
| Latency control | Provider-dependent, shared | Tunable, co-locate, custom kernels |
| Customisation | Limited fine-tuning options | Full fine-tuning, LoRA, custom decoding |
| Privacy/compliance | Data leaves your boundary (DPAs, zero-retention options) | Full control, data residency |
| Reliability | Provider SLAs, rate limits | You own on-call, scaling, upgrades |
| Time to market | Hours | Weeks to months |
| Hidden costs | Rate limits, price changes, vendor lock-in, model deprecations | Engineering headcount (MLOps/SRE), networking, storage, monitoring, security, idle capacity, under-utilisation, hardware refresh, energy |

**Decision guidance**

- Start with APIs (prototype, uncertain volume). Move to self-hosting when volume is **large and predictable**, privacy demands it, a fine-tuned small model beats the API at lower cost, or latency/control needs justify it.
- **Hybrid:** route simple/high-volume tasks to self-hosted small models and hard ones to frontier APIs; use API as overflow and fallback; batch APIs for offline work; prompt caching discounts.
- Include **total cost of ownership**: people, tooling, redundancy (N+1), peak provisioning, and the opportunity cost.
- Re-evaluate quarterly: prices fall quickly and open models improve.
