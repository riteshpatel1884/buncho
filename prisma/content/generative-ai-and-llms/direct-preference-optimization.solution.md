**Insight:** the KL-regularised RLHF objective has a closed-form optimal policy, so the **reward can be written in terms of the policy and a reference model**: `r(x, y) = beta * log( pi(y|x) / pi_ref(y|x) ) + const`. Plugging this into the Bradley-Terry preference model removes the need to train a reward model or run RL.

**Loss** (for prompt `x`, preferred answer `y_w`, rejected answer `y_l`):

`L = - log sigmoid( beta * [ log(pi(y_w|x)/pi_ref(y_w|x)) - log(pi(y_l|x)/pi_ref(y_l|x)) ] )`

```python
import torch.nn.functional as F

def dpo_loss(pi_w, pi_l, ref_w, ref_l, beta=0.1):
    # each argument is the summed log-prob of the full response under that model
    margin = beta * ((pi_w - ref_w) - (pi_l - ref_l))
    return -F.logsigmoid(margin).mean()
```

It raises the likelihood of chosen answers relative to rejected ones, with `beta` controlling how far the policy can move from the reference.

**Compared with PPO-RLHF:** no reward model, no sampling loop, no critic; only two models in memory (policy, frozen reference) and a plain supervised-style training loop. Much simpler and more stable.

**Limitations**

- Offline: learns only from the fixed preference set (distribution mismatch with the model's own outputs); on-policy or iterative DPO helps.
- Can over-optimise, lowering the likelihood of both answers or favouring verbosity.
- Quality depends heavily on preference data quality.
- Less suited to tasks with verifiable rewards than RL.

Variants: IPO, KTO, ORPO, SimPO.
