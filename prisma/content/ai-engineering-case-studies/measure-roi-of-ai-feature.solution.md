**Formula:** ROI = (benefit − cost) / cost, plus payback period and net value per month.

**Benefits (pick measurable ones, tie to a business metric)**

- **Efficiency:** time saved x adoption x loaded hourly cost (agent assist, coding tools); handle time reduction.
- **Cost deflection:** tickets resolved without humans x cost per ticket.
- **Revenue:** conversion, retention, upsell, average order value uplift.
- **Quality/risk:** fewer errors, rework, compliance incidents.
- **Strategic:** speed to market, capability that did not exist.

**Costs (total cost of ownership)**

- Inference/API or GPU, embeddings and vector storage, third-party tools.
- **Engineering and maintenance**, evaluation, monitoring, prompt/model updates.
- **Human review and escalations**, data labelling, legal/security review, training and change management.
- Cost of failures (refunds, incidents).

**Worked example (support deflection):** 100,000 tickets/month; AI resolves 30% at $5 per human ticket saved = $150,000/month benefit. Cost: $40,000/month (inference, review, team share). ROI = (150 − 40) / 40 = **2.75 (275%)**; check quality metrics (CSAT, reopen rate) so savings are not bought with worse service.

**Attribution:** use an **A/B test or holdout group**, not before/after (seasonality). Track adoption and usefulness (acceptance rate, edits), outcome metrics (resolution, conversion), guardrail metrics (escalations, complaints), and unit economics (cost per successful task).

**Pitfalls:** counting time saved that is not redeployed, ignoring maintenance and review costs, vanity metrics (messages sent), launch-novelty effects, ignoring tail costs (long contexts, agents looping), and not re-measuring as prices and usage change.

**Communicate** a range (conservative / expected / optimistic) with assumptions, and review monthly.
