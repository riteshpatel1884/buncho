**1. Measure first**

Emissions ≈ energy (kWh) × data-centre overhead (PUE) × **grid carbon intensity** (gCO2/kWh), plus embodied hardware and water use. Track with **CodeCarbon, Zeus, ML CO2 Impact, cloud carbon dashboards**. Count the full lifecycle: experiments and hyper-parameter sweeps, training, and **inference at scale** (often the larger share for deployed models).

**2. Reduce**

| Lever | Actions |
|---|---|
| **Avoid training** | Reuse pretrained models; **fine-tune, LoRA/QLoRA**, prompt or RAG instead of training from scratch; share checkpoints |
| **Right-size** | Smaller or distilled models when quality allows; pruning; sparse/MoE architectures; early stopping |
| **Efficient training** | Mixed precision (bf16/fp8), efficient attention (FlashAttention), gradient checkpointing, better data (curation/dedup improves quality per FLOP), scaling laws to choose compute-optimal size, cheaper hyper-parameter search (Bayesian, successive halving, small proxies), fewer full reruns, good utilisation |
| **Hardware** | Newer, efficient accelerators; high utilisation (avoid idle GPUs), right instance types |
| **Where and when** | Run in **low-carbon regions** and renewable-powered data centres, carbon-aware scheduling (shift flexible jobs to low-intensity hours), providers with 24/7 carbon-free energy |
| **Inference** | Quantisation, distillation, batching, KV/prompt/semantic caching, speculative decoding, routing easy queries to small models, cap output length, autoscaling |
| **Lifecycle** | Retire unused models and endpoints, retrain only when drift/metrics demand it, store less data |

```python
from codecarbon import EmissionsTracker
with EmissionsTracker(project_name="finetune-v3") as t:
    train()       # emissions (kg CO2eq) logged to emissions.csv
```

**3. Govern:** set emission budgets per project, report in model cards, include efficiency in model-selection criteria (quality per kWh), use carbon offsets only after reduction (not a substitute), and consider disclosure requirements (EU CSRD, AI Act energy-use documentation for GPAI).
