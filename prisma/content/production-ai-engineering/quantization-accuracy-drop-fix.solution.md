**1. Measure properly**

- Compare to the bf16 baseline on **your task evals** (not only perplexity): accuracy, format validity, long-context, multilingual, code, safety. Look at **which categories** drop.
- Confirm it is quantisation, not a pipeline bug: wrong chat template, tokenizer mismatch, wrong dtype, broken kernels, mismatched group size, different sampling parameters.

**2. Localise the damage**

- Quantise **layer by layer** (or module type by module type) and measure the effect; find sensitive layers (often embeddings, `lm_head`, first/last blocks, attention output, MLP down-projection).
- Check activations for **outlier channels**; check whether weights, activations or the KV cache cause the loss.

**3. Fix, from cheapest to most involved**

1. **Use a higher precision / better format:** FP8 or INT8 instead of 4-bit; 4-bit **with** group size 64 or 128; 5 to 6-bit k-quants.
2. **Keep sensitive layers in higher precision** (mixed precision), e.g. `lm_head` and embeddings in 16-bit.
3. **Better algorithm:** AWQ or GPTQ rather than naive round-to-nearest; SmoothQuant/rotation for activation quantisation; tune damping and ordering.
4. **Better calibration data:** a few hundred to a few thousand samples that match your domain, language and prompt format (calibrating on generic English then serving code or Hindi hurts).
5. **Quantise less:** weights only, leave activations and KV cache in 16-bit (or quantise the KV cache to FP8 only).
6. **Recovery training:** QAT or short **LoRA/QLoRA fine-tuning** on the quantised model with distillation from the full-precision model.
7. **Use a larger quantised model** vs a smaller full-precision one: for a fixed memory budget a bigger 4-bit model often beats a smaller 16-bit model.
8. **Smaller scope:** fine-tune/specialise, or distil into a smaller model instead of quantising aggressively.

**4. Validate and guard:** set an accuracy-regression budget in CI, test on tail cases and long contexts, canary the quantised model against the baseline in production, and keep rollback ready.

**Decision rule:** try FP8/INT8 first; if memory forces 4-bit, use AWQ/GPTQ with group-wise scales and domain calibration; escalate to mixed precision and recovery fine-tuning when evals demand.
