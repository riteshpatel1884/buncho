**Why it happens:** large models memorise rare or repeated sequences, especially duplicated text, long unique strings (keys, emails) and small fine-tuning sets trained for many epochs. Extraction attacks use prefixes or repeated-token prompts to pull it out.

**Before training**

- **Data governance:** do not train on secrets or PII unless needed; scrub with PII/secret detectors.
- **Deduplicate** (exact and near-duplicate); duplicates are the largest driver of memorisation.
- Consider **RAG with access control** instead of baking private knowledge into weights.

**During training**

- Fewer epochs, lower learning rate, more diverse data, early stopping.
- **Differential privacy** (DP-SGD) gives formal guarantees at a quality/compute cost.
- Measure memorisation: prompt with the first part of training examples and check for verbatim continuation, or insert canary strings and test for them.

**At inference**

- **Output filters:** n-gram/hash matching against protected documents, regex for secrets and PII, DLP tools.
- Rate limiting and monitoring to block extraction attempts; system prompts that refuse repetition attacks.
- Per-user authorisation so sensitive content is never in context for unauthorised users.

**If it has already leaked:** retrain or fine-tune without the data (machine unlearning is still unreliable), rotate any exposed secrets, and run an incident review.

```python
import re
SECRET = re.compile(r"(AKIA[0-9A-Z]{16}|[\w.+-]+@[\w-]+\.[\w.]+)")
def filter_output(text): return SECRET.sub("[REDACTED]", text)
```
