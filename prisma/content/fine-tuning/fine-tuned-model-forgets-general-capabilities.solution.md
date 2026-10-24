**Confirm:** run general benchmarks and your own regression prompts on the base vs tuned model (instruction following, reasoning, coding, multilingual, safety/refusals), so you know **what** was lost.

**Why it happens:** gradient updates on a narrow distribution move many weights away from the values that supported other skills; high learning rate, many epochs, full fine-tuning and a very narrow dataset make it worse. Safety behaviour is especially fragile.

**Fixes**

1. **Switch to PEFT** (LoRA/QLoRA): the frozen base keeps general ability; use smaller rank or fewer modules if drift persists.
2. **Replay / data mixing:** include **10 to 30% general instruction data** (the original SFT mix, open instruction sets, safety data) in every batch.
3. **Gentler training:** lower the learning rate, fewer epochs/steps, early stopping on a **general-capability validation set** as well as the domain set.
4. **Regularise toward the original:** KL penalty to the base/SFT model, or L2-to-initial / EWC-style penalties.
5. **Weight-space merging:** interpolate tuned and base weights (WiSE-FT), or scale down the LoRA ($\alpha$ lower, or merge at weight 0.5 to 0.8), recovering general skills with modest domain loss.
6. **Multi-task training:** train domain and general tasks together instead of sequentially.
7. **Move knowledge out of weights:** RAG for facts, so less training is needed.
8. For safety loss, **re-run safety/refusal tuning** or include safety examples.

```python
# interpolate: theta = (1 - a) * theta_base + a * theta_tuned
for (n, p_base), (_, p_tuned) in zip(base.named_parameters(), tuned.named_parameters()):
    p_tuned.data.mul_(a).add_(p_base.data, alpha=1 - a)
```

**Validate:** plot a trade-off curve (domain score vs general score) across settings (mixing ratio, LR, merge weight) and choose the point that meets both requirements; keep regression tests in CI.
