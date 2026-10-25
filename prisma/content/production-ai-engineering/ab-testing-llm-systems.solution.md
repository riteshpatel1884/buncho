**Goal:** measure the real-world effect of a change (new prompt, model, retrieval setting, guardrail) before full rollout.

**Process**

1. **Offline first:** screen candidates on your eval set; only promising ones reach production.
2. **Hypothesis and metrics:** one primary metric plus guardrails.
   - Primary: task success, resolution rate, conversion, acceptance rate of suggestions.
   - Secondary: thumbs up/down, edit distance, retries/regenerations, session length.
   - Guardrails: latency, cost per request, error rate, safety violations, hallucination rate.
3. **Randomisation:** assign by **user (or session) hash** so a user keeps one variant; use consistent bucketing via feature flags. Avoid request-level randomisation when conversations span turns.
4. **Sample size and duration:** compute the needed sample from the baseline rate, minimum detectable effect and variance; run at least a full weekly cycle; LLM metrics are noisy, so expect larger samples.
5. **Analysis:** confidence intervals, appropriate tests for proportions or means, **multiple-comparison corrections** if testing many variants, segment analysis (language, user type), check sample-ratio mismatch.
6. **Decide and roll out gradually:** ship the winner behind a flag, keep a holdout for long-term effects.

**Evaluation of subjective quality online:** LLM-judge pairwise comparisons on sampled production traffic, human review samples, implicit signals (copy, accept, follow-up questions), **interleaving** for ranking/RAG variants.

```python
import hashlib
def variant(user_id, experiment, split=0.5):
    h = int(hashlib.sha256(f"{experiment}:{user_id}".encode()).hexdigest(), 16) % 10_000
    return "B" if h < split * 10_000 else "A"
```

**Pitfalls:** novelty effects, model non-determinism (log seeds/versions), provider updates mid-test, peeking at results repeatedly, metrics that improve while cost doubles, contamination between variants through shared caches or memory, and optimising a proxy metric (e.g. response length). Use **shadow mode** (run B silently) to compare outputs without user impact, and **canary + multi-armed bandits** when you want to shift traffic adaptively.
