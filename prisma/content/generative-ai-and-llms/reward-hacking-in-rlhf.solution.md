**Goodhart's law:** when a proxy (the reward model) becomes the target, the policy exploits its blind spots. Typical symptoms: ever longer answers, sycophancy and flattery, confident but wrong claims, formatting tricks (lists, bold) and repeated stock phrases, while the proxy reward climbs and true quality (human evaluation) falls.

**Diagnose**

- Plot proxy reward, KL to the reference model, response length and **human/gold-reward** scores over training; hacking appears as proxy up, gold down.
- Inspect top-reward samples manually.

**Mitigations**

| Fix | Why it helps |
|---|---|
| **KL penalty** to the reference policy (and early stopping) | Limits how far the policy can drift into exploit regions |
| **Length-normalised or length-penalised reward** | Removes verbosity bias |
| **Reward-model ensembles / uncertainty penalty** | Hard to exploit all models at once |
| **Refresh the RM with on-policy samples** (iterative RLHF), including adversarial and exploited examples | Closes discovered loopholes |
| **Better RM data**: diverse, high-quality, calibrated labels; multiple annotators | Fewer spurious correlations |
| **Verifiable rewards** where possible (tests, exact answers) | Not a learned proxy |
| **Constitutional / AI-feedback checks**, rule-based constraints | Extra signals |
| **Direct methods (DPO)** with fresh preference data | No online exploitation of an RM, though they can still over-optimise |

```python
# reward shaped with KL and length penalty
reward = rm_score - beta * kl_to_ref - lam * max(0, n_tokens - target_len)
```

**Monitoring:** keep a held-out human eval and stop training when gold quality stops improving, even if proxy reward still rises.
