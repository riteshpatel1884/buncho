**Idea:** train a small **student** to imitate a large **teacher**. The teacher's full output distribution (soft targets) tells the student how classes relate ("cat" is closer to "lynx" than to "truck"), which carries more information than a one-hot label.

**Loss**

`L = alpha * KL( softmax(z_t / T) || softmax(z_s / T) ) * T^2 + (1 - alpha) * CE(y, softmax(z_s))`

`T > 1` softens both distributions so small probabilities are visible.

```python
import torch.nn.functional as F

def distill_loss(student_logits, teacher_logits, labels, T=2.0, alpha=0.5):
    soft = F.kl_div(F.log_softmax(student_logits / T, -1),
                    F.softmax(teacher_logits / T, -1), reduction="batchmean") * T * T
    hard = F.cross_entropy(student_logits, labels)
    return alpha * soft + (1 - alpha) * hard
```

**Variants for LLMs**

- **Logit distillation:** match next-token distributions (needs the same tokenizer).
- **Sequence-level / data distillation:** the teacher generates answers, reasoning traces or synthetic data and the student is fine-tuned on them. Works even with API-only teachers.
- **Feature/hidden-state distillation** and **on-policy distillation** (student samples, teacher scores).

**Uses:** smaller, cheaper, lower-latency models (e.g. on-device), and transferring reasoning ability.

**Limits:** the student rarely exceeds the teacher; it can inherit the teacher's errors and bias; complex multi-step reasoning transfers worst; check the teacher's licence terms.
