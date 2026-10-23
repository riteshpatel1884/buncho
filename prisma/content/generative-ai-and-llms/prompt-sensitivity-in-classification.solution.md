**Measure sensitivity**

Create 10 to 20 semantically equivalent variants of the prompt (reorder sentences, synonyms, formatting) and score each on the eval set. Report mean, standard deviation and the share of items whose label changes. A high spread means you are tuning noise.

**Why it happens:** the model's behaviour depends on surface form, label names, example order and formatting; weak models and ambiguous tasks are more sensitive.

**Fixes**

1. **Make the task unambiguous:** clear label definitions, decision rules and a fallback label; unclear tasks amplify wording effects.
2. **Use structured output:** a fixed schema with an enum of labels instead of free text.
3. **Stronger or more consistent model;** sensitivity usually decreases with model quality.
4. **Ensemble prompts:** run 3 to 5 paraphrased prompts (and shuffled example orders) and take a majority vote; low agreement goes to review.
5. **Score with label probabilities** (logprobs) rather than the generated text, and calibrate the threshold.
6. **Dynamic few-shot examples** chosen by similarity.
7. **Optimise against variants:** pick the prompt that performs best *on average across paraphrases* (robust optimisation), not the single best wording; use a held-out test set.
8. **Fine-tune** a smaller classifier on the labelled data when volume and stability matter; it is far less wording-sensitive.
9. **Pin versions:** pin model version and prompt version; re-run the eval suite on every change or model upgrade.

```python
def sensitivity(prompts, data):
    accs = [evaluate(p, data) for p in prompts]
    return {"mean": mean(accs), "std": pstdev(accs), "min": min(accs)}
```

**Goal:** a prompt whose accuracy is high *and* stable under harmless rewording.
