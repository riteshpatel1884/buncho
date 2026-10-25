**Order of attack (cheapest first)**

1. **Start with a foundation model, zero/few-shot:** a good prompt with 3 to 10 examples often reaches production quality for classification, extraction and generation. Needs only a **small eval set** (100 to 300 hand-labelled items), not a training set.
2. **Label smartly:** write clear guidelines, label a seed set yourself/with domain experts, measure inter-annotator agreement; use **LLMs as annotators** (pre-label, humans review disagreements) and distil into a small model if cost/latency demands.
3. **Active learning:** train/prompt, find uncertain or diverse examples (low confidence, disagreement between prompts/models), and label only those; typically cuts labelling by half or more.
4. **Weak supervision:** heuristics, regexes, knowledge bases, existing system outputs as **labelling functions** combined by Snorkel-style models into noisy labels.
5. **Transfer learning and fine-tuning:** fine-tune a pretrained model (LoRA) on the few hundred good labels; use pretrained embeddings plus a light classifier (logistic regression) for few-shot supervised tasks (SetFit).
6. **Data augmentation and synthetic data:** paraphrasing, back-translation, LLM-generated examples (diverse prompts, filter for quality, mix with real data, never evaluate on synthetic data alone).
7. **Retrieval over labels:** kNN few-shot, i.e. retrieve the most similar labelled examples into the prompt.
8. **Self/semi-supervised learning** on unlabelled in-domain data (continued pretraining, pseudo-labelling with confidence thresholds).
9. **Human-in-the-loop in production:** collect feedback and corrections as new labels; route low-confidence cases to humans.

**Evaluation with scarce labels:** hold out a **frozen, high-quality test set** (stratified), report confidence intervals (small n), use cross-validation for trained components, check slices, and bootstrap to compare approaches.

**Pitfalls:** label leakage between train/test, noisy labels from poor guidelines, over-trusting LLM labels (validate against humans), ignoring class imbalance, and tuning on the tiny test set.

**Answer in one line:** "Use a pretrained model with few-shot prompting, invest labelling effort in a clean eval set and the hardest examples via active learning, then fine-tune only if the data and metrics justify it."
