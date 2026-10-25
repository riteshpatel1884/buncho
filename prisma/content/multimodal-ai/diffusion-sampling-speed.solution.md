**Latency = steps × cost per step + encoders/VAE + overhead.** Profile first (e.g. 50 steps × 40 ms ≈ 2 s).

**A. Fewer steps**

- **Better ODE/SDE solvers:** DDIM, **DPM-Solver++**, UniPC, Heun/Euler with Karras sigmas: 50 steps to **15-25** with little loss, no retraining.
- **Distillation to few steps:** **progressive distillation**, **consistency models / LCM (LoRA available)**, **adversarial distillation (SDXL-Turbo, SD3-Turbo, ADD/LADD)**, **DMD/DMD2**, rectified-flow "reflow", Hyper-SD, Flux-schnell: 1 to 4 steps; trade-off is sharper but less diverse outputs.
- **CFG distillation** (guidance-free student) removes the doubled forward pass.
- **Flow matching models** inherently use straighter paths and need fewer steps.

**B. Cheaper steps**

- **Quantisation** (FP8/INT8/NF4 weights, SVDQuant), **torch.compile / TensorRT**, FlashAttention, fused kernels, channels-last, `bfloat16`.
- **Smaller/faster architecture:** pruned or smaller UNet/DiT, token merging (ToMe for SD), efficient attention, lower resolution base + **latent super-resolution/upscaler** instead of generating at full resolution.
- **Caching:** DeepCache, TeaCache, block/feature caching between adjacent timesteps skip redundant computation; cache text embeddings.
- **Latent space:** use a lighter VAE decoder (TAESD) for previews.

**C. Serving**

```python
pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config, use_karras_sigmas=True)
pipe.unet = torch.compile(pipe.unet, mode="max-autotune")
image = pipe(prompt, num_inference_steps=20, guidance_scale=5.0).images[0]
```

- Batch requests, GPU warm pools, async queues, progressive previews, multi-GPU parallelism (patch/pipeline parallel such as DistriFusion), pick a faster GPU (H100/L40S), and cache results for repeated prompts/seeds.

**Process:** set a quality budget (FID/CLIPScore/human preference at fixed prompts), sweep steps and solver, then add distillation/quantisation if still above the latency target; re-check **diversity and prompt adherence** after each change.
