**LLM-as-a-judge:** a strong LLM scores or compares outputs using a rubric. It scales human-like judgment to thousands of examples cheaply and handles open-ended text that string metrics cannot.

**Modes**

- **Single-answer grading:** score on defined criteria (1 to 5), with reasoning.
- **Pairwise comparison:** "which answer is better?" (more reliable than absolute scores; used for A/B tests and arenas).
- **Reference-guided:** compare with a gold answer to check correctness.
- **Checklist/atomic criteria:** many yes/no questions ("cites a source?", "mentions the refund window?").

**G-Eval (Liu et al., 2023)**

1. Give the judge the task and criteria; it generates **evaluation steps via chain-of-thought** (or you supply them).
2. A form-filling prompt asks for a score.
3. Instead of taking the single sampled score, compute a **probability-weighted score** from the token log-probabilities over possible scores (e.g. 1 to 5), yielding finer-grained, less tied scores.

It improved correlation with human ratings on summarisation and dialogue benchmarks compared with older metrics.

**Limitations and biases**

| Issue | Mitigation |
|---|---|
| **Position bias** (prefers first/second) | Randomise order; run both orders and keep consistent verdicts |
| **Verbosity/length bias** | Control length, instruct on conciseness, length-normalised win rates |
| **Self-preference** (favours own style/model family) | Use a different or multiple judges |
| **Sycophancy / leniency, score inflation** | Anchored rubrics with examples, pairwise tests |
| Weak at **factual verification** without sources, maths, long documents | Provide references/context, use tools or programmatic checks |
| **Prompt sensitivity and non-determinism** | Temperature 0, fixed prompts, repeat and aggregate |
| Misaligned with your users | **Calibrate against human labels** (agreement, e.g. Cohen's kappa), refresh periodically |
| Cost/latency | Cheaper judges for screening, sample for large sets |

**Best practice:** treat the judge as a model that itself needs evaluation: build a small human-labelled set, measure judge-human agreement, keep rubrics specific, ask for reasoning before the score, and combine with deterministic checks and periodic human review.
