**Golden dataset (golden set):** a curated, high-quality collection of inputs paired with **trusted expected outputs or labels** (or evaluation criteria), used as the stable reference for measuring and comparing system versions.

**Roles**

- **Ground truth for metrics:** accuracy, F1, retrieval recall, factual correctness.
- **Regression gate:** every prompt, model or pipeline change runs against it; releases are blocked on drops.
- **Comparison baseline** across models, prompts and providers.
- **Calibration set** for LLM judges and automated metrics (compare judge scores to gold labels).
- **Shared definition of quality** across product, engineering and domain experts.

**What makes a good golden set**

- **Representative:** reflects real traffic and task distribution, including long-tail, ambiguous, adversarial and multilingual cases; stratified slices to see per-segment performance.
- **Correct and consistent labels:** reviewed by domain experts, double-annotated with agreement checks, with written guidelines; contested items adjudicated.
- **Appropriate size:** hundreds of well-chosen cases beat thousands of noisy ones; enough per slice for useful confidence intervals.
- **Rich metadata:** category, difficulty, source, rubric, expected sources/documents (for RAG), reference answer or key facts rather than a single exact string when many answers are valid.
- **Separation:** keep a **frozen test split** that is never used for prompt tuning or training, plus a dev split for iteration (avoid overfitting to the golden set).

**Building it:** start from production logs and real user questions, add expert-written cases and failure examples; use LLMs to draft candidates, but **verify with humans**; version it (data version tagged in every result).

**Maintenance:** add new failure modes regularly, retire outdated items (policies and facts change), watch for contamination (items leaking into prompts or fine-tuning data), re-validate labels, and refresh when the product scope changes.

**Limits:** it is a sample, so passing it does not guarantee production quality; static sets age; high costs of expert labelling; overfitting risk. Combine with online evaluation and ongoing sampling from live traffic.
