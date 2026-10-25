**1. Clarify the number (do not argue about a percentage in the abstract)**

- Is 15% on a curated edge-case set or on real traffic? What fraction of traffic are those edge cases? How was a hallucination defined and judged? Confidence interval (a 100-item set is noisy)?
- **Translate to exposure:** if edge cases are 4% of 1,000,000 monthly queries, 15% of them wrong is 1,000,000 x 0.04 x 0.15 = **6,000 incorrect answers a month**, about 200 a day.

**2. Translate to impact:** what happens when one is wrong? Severity matters more than rate:

| Severity | Example | Typical stance |
|---|---|---|
| Low | Wrong trivia in a casual helper | Ship with disclosure and feedback |
| Medium | Wrong policy answer causing support rework | Ship with citations, escalation, monitoring |
| High | Medical, legal, financial, safety-related, brand damage | Do not ship as is; add review/abstention |

Also consider reputation, legal exposure, support cost and trust erosion.

**3. Present options, not only a veto**

| Option | Effect |
|---|---|
| **Scoped launch:** limit to the supported topics/segments where accuracy is high, block edge cases | Reduces exposure |
| **Abstain/escalate:** detect low-confidence/unsupported queries and say "I'm not sure" or hand to a human | Trades coverage for correctness |
| **Citations and source links** so users can verify | Lowers harm |
| **Human review** for high-risk answers | Cost vs safety |
| **Mitigation sprint:** RAG improvements, verification step, better prompts/model, targeted fine-tuning, then re-measure | Lower the rate |
| **Staged rollout:** 5% canary, monitor, expand with kill switch | Contains impact |
| **UX framing:** clear disclaimers, feedback button | Sets expectations |

**4. Recommend and set launch criteria:** e.g. "Ship to 5% with abstention and citations if the hallucination rate on the real-traffic sample is under 5% and severity-high categories are excluded; expand when we reach X for two weeks; we have a rollback owner and monitoring." Put it in writing with the PM as co-owner of the decision.

**5. Tone:** collaborative, data-driven, focused on the shared goal (launch success), not "AI is risky". Offer a timeline for the mitigation path.
