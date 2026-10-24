**Always compare against baselines:** the base model with a good prompt (and few-shot), the previous fine-tune, and where relevant RAG or a larger model.

**1. Task metrics on a held-out test set** (never seen in training, deduplicated):
- Classification/extraction: accuracy, precision/recall/F1, exact match, JSON validity rate.
- Generation: **LLM-as-judge** with a rubric, pairwise win rate vs baseline, human review of a sample\; ROUGE/BLEU only for narrow cases.
- Code: unit-test pass rate (pass@k). Maths/reasoning: exact answer match.

**2. Regression checks:** run **general benchmarks** (MMLU, HellaSwag, instruction-following, coding) to detect catastrophic forgetting, plus your own capability tests that worked before.

**3. Behavioural tests:** format adherence, refusal and safety prompts, **hallucination rate** on unanswerable questions, robustness to paraphrase, long inputs, multilingual inputs, prompt-injection cases.

**4. Training diagnostics:** train vs validation loss (overfitting shows as a rising validation loss)\; but **loss is not quality**, so inspect actual generations.

**5. Production-like evaluation:** shadow traffic or A/B testing\; track user feedback, escalation rates, latency, cost per request.

```python
def win_rate(judge, prompts, a_outputs, b_outputs):
    wins = sum(judge(p, a, b) == "A" for p, a, b in zip(prompts, a_outputs, b_outputs))
    return wins / len(prompts)       # randomise A/B order inside judge() to remove position bias
```

**Good practice:** fixed eval suite versioned alongside the data, confidence intervals (small test sets are noisy), slice analysis by category, and decide promotion thresholds before looking at results.
