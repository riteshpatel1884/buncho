**Symptom analysis:** sharp, high-fidelity but similar compositions/faces/poses across prompts or seeds = **reduced diversity (mode collapse)**, a classic quality-diversity trade-off.

**Common causes**

- **High classifier-free guidance (CFG):** pushes samples toward the high-density prompt-conditional mode: crisper, more saturated, less varied.
- **Few-step distilled/turbo models** and consistency models (trained to match a teacher's sharp outputs).
- **Over-fine-tuning:** aggressive LoRA/DreamBooth, RLHF/aesthetic-score optimisation (reward hacking) narrowing style.
- **Deterministic samplers** (DDIM, eta=0) and low noise; fixed seeds; **low-diversity training data** or duplicated images.
- Prompt too specific or prompt templates the same for all requests.

**Fixes**

| Lever | Action |
|---|---|
| **Guidance** | Lower CFG (e.g. 3 to 6), **guidance scheduling** (high early or mid, low late), **CFG interval** / limited-interval guidance, dynamic thresholding, APG/CFG++ variants |
| **Sampler** | Stochastic samplers (Euler ancestral, DPM++ SDE, higher eta), more steps, noise injection, different seeds/initial noise perturbations |
| **Prompt-side diversity** | Randomised attributes (style, camera, lighting, subject variations), LLM prompt expansion, negative prompts, prompt interpolation |
| **Model** | Use less aggressively distilled or tuned checkpoint; lower LoRA strength/rank, early stopping; mix in a base model; model merging |
| **Training** | Deduplicate and diversify data, add diversity regularisation (prior preservation), diversity-aware rewards, "diverse" best-of-N selection with embedding-distance penalty (DPP/MMR) |
| **Sampling-time diversity methods** | Particle guidance, repulsive/orthogonal latents, CADS (condition-annealed noise) |

**Measure the trade-off:** quality via FID/CLIPScore/aesthetic and human preference; diversity via **Recall (precision-recall for generative models)**, **Vendi score**, LPIPS pairwise distance, or CLIP-embedding variance across seeds for a fixed prompt. Plot **guidance scale vs quality and diversity** and select an operating point per use case (product photos favour fidelity; ideation favours diversity).
