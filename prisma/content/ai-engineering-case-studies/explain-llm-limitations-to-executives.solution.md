**Lead with the answer, in plain words (30 seconds)**

"An LLM doesn't look up facts like a database; it predicts the most likely next words based on patterns it learned. That makes it brilliant at language and reasoning over text, but it can also produce a confident, fluent answer that is wrong. Like a very well-read new hire who sometimes misremembers and rarely says 'I don't know' unless we train and set the process for that. We can reduce errors a lot, but not to zero, so we design the **system** to catch and contain them."

**Useful analogies**

- **Smart intern with a great memory but no source access:** gives good first drafts; important work needs checking.
- **Weather forecast:** very useful, probabilistic; we measure accuracy and plan around it.
- **Spell-checker/search:** valuable even though imperfect; we judge by outcomes, not perfection.
- Even humans are not 100% accurate, and the right comparison is **AI + process vs the current process** (human error rates, cost, speed).

**Why 100% is not achievable**

1. **Probabilistic generation:** outputs are sampled; the same question can produce slightly different answers.
2. **No built-in truth check:** it optimises plausibility; gaps in knowledge, outdated data, ambiguous questions lead to confident errors.
3. **Open-ended input:** users can ask anything, including edge cases and adversarial prompts; we cannot test every case.
4. **Ambiguity and subjectivity:** "correct" sometimes depends on interpretation.

**What we can control (the executive-level message)**

- Measure accuracy on a representative test set and **set a target** (e.g. 95% on supported questions) with an agreed error budget.
- Reduce errors: ground answers in company documents with citations, restrict scope, verification steps, better models.
- **Contain errors:** say "I don't know", escalate to humans for high-risk cases, human review, monitoring and rollback.
- Align the level of accuracy to the risk: higher stakes → more safeguards.

**Close with decisions for them:** "What error rate is acceptable for this use case, and what's the cost of an error? Based on that, here are the options and their costs." That shifts the conversation from a binary promise to a managed risk.
