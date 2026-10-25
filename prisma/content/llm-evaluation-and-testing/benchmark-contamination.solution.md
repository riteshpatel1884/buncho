**Contamination** occurs when benchmark test data (questions, answers, or near-copies) appears in a model's **training data**, so scores measure memorisation rather than generalisation. Because pre-training uses huge web crawls and benchmarks are published online, leakage is common; **fine-tuning on benchmark-like data** or synthetic data derived from it also counts.

**How it happens:** direct inclusion of test sets, copies on GitHub/forums/blogs, paraphrased or translated versions, answers in explanations, instruction-tuning mixtures that include benchmark training splits, and iterative tuning against the test set (overfitting by leaderboard chasing).

**Detection**

- **N-gram overlap / exact-match search** between benchmark items and training corpora (when you control the data), e.g. 13-gram overlap.
- **Completion/perplexity tests:** the model completes a test question verbatim or has unusually low perplexity on test items vs paraphrases; **min-k% prob** membership inference.
- **Perturbation sensitivity:** accuracy drops sharply when options are reordered, numbers changed or wording paraphrased.
- **Compare old vs new benchmark versions** (e.g. GSM8K vs a freshly written GSM1k with similar difficulty: some models drop notably).
- Analyse score gaps between public and private splits.

**Prevention and mitigation**

1. **Hold-out private test sets** never released publicly; rotate them.
2. **Dynamic/live benchmarks** with fresh data after the model's training cutoff (LiveCodeBench, LiveBench) and **procedurally generated** variants.
3. **Decontaminate training data:** remove n-gram matches of known benchmarks before training.
4. **Canary strings** in published datasets so crawlers and filters can exclude them.
5. Evaluate on **your own proprietary tasks**, not only public benchmarks.
6. Report evaluation details and contamination analyses; avoid tuning prompts on the test set, use separate dev and test splits.
7. Gate access (hosted evaluation APIs) or encrypt datasets.

**For your own eval sets:** keep them out of prompts, few-shot examples and fine-tuning data; version and restrict access; split by source document; check that retrieval corpora do not contain the answers verbatim.
