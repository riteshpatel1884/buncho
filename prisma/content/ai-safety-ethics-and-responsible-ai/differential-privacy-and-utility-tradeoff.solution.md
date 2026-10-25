**Differential privacy (DP):** a randomised algorithm $M$ is $(\varepsilon,\delta)$-DP if for any two datasets differing in one person's record and any output set $S$:

$$\Pr[M(D)\in S] \le e^{\varepsilon}\Pr[M(D')\in S] + \delta$$

Intuition: the output barely changes whether or not any one individual is included, so it limits what an attacker (membership inference, memorisation) can learn about them. Smaller $\varepsilon$ = stronger privacy.

**DP-SGD (training)**

1. Compute **per-example gradients**.
2. **Clip** each to norm $C$ (bounds individual influence).
3. Sum and add **Gaussian noise** $\mathcal N(0,\sigma^2C^2I)$.
4. Update; a **privacy accountant** (moments/RDP) tracks cumulative $\varepsilon$ over steps given sampling rate $q$ and $\sigma$.

```python
# Opacus
from opacus import PrivacyEngine
model, opt, loader = PrivacyEngine().make_private_with_epsilon(
    module=model, optimizer=opt, data_loader=loader,
    target_epsilon=8.0, target_delta=1e-5, epochs=20, max_grad_norm=1.0)
```

Other forms: PATE (noisy teacher voting), DP fine-tuning of LLMs (with LoRA), DP synthetic data, DP statistics/analytics, local DP.

**Why accuracy drops:** clipping biases gradients and noise scales with model size and shrinks with batch size and data size.

**Balancing privacy vs utility**

- **Choose the target deliberately:** practical $\varepsilon$ is often 1-10; set from risk and regulation, not accuracy alone.
- **Large batches** and more data (noise averages out), tune clip norm and learning rate, more epochs only if the budget allows.
- **Pre-train on public data**, then DP fine-tune (large gains), parameter-efficient methods (fewer noisy parameters), smaller models or frozen features.
- Better architectures (group norm instead of batch norm), data augmentation with care, and tighter accounting (RDP/PRV).
- **Evaluate with privacy attacks** (membership inference, canary extraction) to confirm real protection and report the privacy-utility curve to stakeholders.
- Combine with non-DP controls (dedup, access control) when DP is too costly.
