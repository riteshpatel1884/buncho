**Diagnose**

1. **Sampling noise:** run the same input 10 times. If outputs vary, set temperature to 0 (or very low) and top-p to 1; note that some APIs are still not perfectly deterministic.
2. **Example sensitivity:** shuffle example order and swap examples; if results change, the prompt depends on incidental details (recency bias favours the last example's label, majority-label bias favours the most frequent).
3. **Ambiguous labels:** two labels overlap, or definitions are missing, so the model guesses.
4. **Input surface differences:** casing, punctuation or length changes flip the output.

**Fixes**

- **Define each label** precisely in the instruction, including boundary rules and a default ("if neither, use `other`").
- **Balanced, diverse examples:** equal examples per label, include hard and borderline cases, avoid near-duplicates, vary order (but keep it fixed in production).
- **Dynamic example selection:** retrieve the k nearest labelled examples to the current input (kNN few-shot); this usually helps a lot.
- **Constrain output:** enum or JSON schema, short label only; no free text.
- **Calibrate / vote:** self-consistency across several samples or prompt variants and take the majority; use log-probabilities of label tokens for a confidence score and route low-confidence cases to review.
- **Normalise inputs** (trim, consistent case) before sending.
- If still unstable, **fine-tune** a small classifier or model on labelled data.

```python
def classify(text, labels, k=6):
    shots = nearest_examples(text, labeled_pool, k=k)            # similar and label-balanced
    votes = [llm(build_prompt(shots, text, order_seed=s), temperature=0.3) for s in range(5)]
    label, n = Counter(votes).most_common(1)[0]
    return label if n >= 4 else "needs_review"
```

**Measure** consistency explicitly: agreement rate over repeated runs and over paraphrased inputs, alongside accuracy.
