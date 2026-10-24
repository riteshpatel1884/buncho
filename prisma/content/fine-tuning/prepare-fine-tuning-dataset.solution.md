**1. Define the target behaviour** precisely: inputs, ideal outputs, style, refusal rules, and metrics for "good".

**2. Collect** from real sources: production logs, expert-written answers, support tickets, documentation, and carefully filtered synthetic data. Match the **real input distribution** (including messy inputs).

**3. Format** to the model's chat template, one JSON object per example:

```json
{"messages": [
  {"role": "system", "content": "You are a claims assistant."},
  {"role": "user", "content": "Is water damage covered?"},
  {"role": "assistant", "content": "Water damage from burst pipes is covered\; flood is not ..."}]}
```

**4. Clean and filter**

- Remove duplicates and near-duplicates (also **against the test set** to avoid leakage).
- Drop empty, truncated, wrong-language or contradictory examples\; fix label noise.
- Remove or mask **PII and secrets**\; check licences.
- Filter low-quality answers (rules, a reward model, an LLM judge, then human spot checks).
- Make sure answers are **correct**: a model learns your errors with confidence.

**5. Balance and diversify:** cover task types, difficulty and edge cases\; include **negative/refusal and "I don't know"** examples\; avoid one template dominating. Mix in some general data to limit forgetting.

**6. Split** into train / validation / test **by group** (customer, document, conversation), not randomly by row, to prevent leakage. Keep a frozen test set.

**7. Mask the loss** to assistant tokens only\; check **token lengths** and truncation\; pack sequences for efficiency.

**8. Validate:** read a random sample (100+) manually\; run a quick small training run and inspect outputs\; track data versions.

**Size guide:** hundreds to a few thousand excellent examples for style/format\; tens of thousands for harder skills. Grow in measured steps, evaluating each time.
