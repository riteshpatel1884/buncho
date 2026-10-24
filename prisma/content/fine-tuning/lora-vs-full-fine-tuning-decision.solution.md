**Factors**

| Factor | Favours LoRA/QLoRA | Favours full fine-tuning |
|---|---|---|
| **Data size** | Hundreds to tens of thousands of examples | Hundreds of thousands to millions of tokens/examples |
| **Distribution shift** | Style, format, terminology, moderate domain shift | New language, new modality, deep domain knowledge |
| **Compute and memory** | One 24 GB GPU suffices (QLoRA even less) | Multi-GPU, about 16 bytes/param for 7B (112 GB) |
| **Iteration speed** | Hours; many experiments | Slower, costly |
| **Forgetting risk** | Lower (frozen base) | Higher; needs replay and low LR |
| **Serving** | One base + many adapters (multi-tenant, per-customer) | One model per variant |
| **Rollback/versioning** | Tiny adapter files | Whole checkpoints |
| **Quality ceiling** | Slightly lower on hard shifts | Highest |

**Default:** start with **LoRA/QLoRA on all linear layers**, rank 16 to 64. The "LoRA Learns Less and Forgets Less" study found full fine-tuning learns more on hard domains (code, maths) with large data, while LoRA forgets less and is very competitive on narrower tasks.

**Experiment to decide**

1. Fix an evaluation set (domain task + general-capability regression).
2. Train LoRA at r=16 and r=64, and a full FT baseline (if feasible) with tuned learning rates.
3. Compare **quality, forgetting, training cost, serving cost**.
4. If LoRA is within a tolerance (say 1 to 2 points) of full FT, ship LoRA. If a clear gap remains and the data and budget exist, move to full FT (or CPT then SFT).

**Escalation path:** raise rank, add more target modules, try DoRA or LoRA+, increase data quality, then consider full fine-tuning. Often the real gain comes from **better data**, not the method.

**Recommendation for a typical domain assistant:** LoRA/QLoRA + RAG for knowledge, evaluated on a domain test set, with per-customer adapters if needed.
