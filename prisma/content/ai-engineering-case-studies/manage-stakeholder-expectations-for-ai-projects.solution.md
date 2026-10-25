**Why it is hard:** demos look magical, AI is probabilistic, timelines are uncertain (research-like), and early prototypes hide the last 20% (reliability, edge cases, integration, safety).

**Approach**

1. **Align on the problem and success metric early:** a measurable definition of done (e.g. at least 90% correct on an agreed eval set, p95 latency under 3 s, cost under $0.02 per task), signed off by product and business.
2. **Educate with concrete examples:** show failure cases alongside successes; explain that errors cannot reach zero, only be managed (detection, fallback, human review).
3. **Phase the work:** discovery/prototype → evaluation on real data → limited pilot → production hardening. Each phase has exit criteria; promise **learning** early and **reliability** later.
4. **Give ranges, not points:** "we expect 85 to 92% accuracy; we will know in 2 weeks after evaluating on 300 real examples". State assumptions and risks (data quality, vendor changes).
5. **Make progress visible:** a dashboard of eval scores over time, a living list of known failure modes, weekly demos on real inputs rather than curated ones.
6. **Control scope:** capture new asks in a backlog; trade-offs explicit ("adding multilingual support adds 3 weeks and needs an eval set").
7. **Agree the safety net before launch:** human-in-the-loop, fallback behaviour, kill switch, monitoring, incident owner.
8. **Handle pressure to ship:** quantify risk ("6,000 wrong answers a month at current rates") and offer options (limited rollout, narrower scope, human review) rather than a flat no.
9. **Post-launch expectations:** AI quality needs maintenance (drift, prompts, models); budget for it.

**Principle:** under-promise on certainty, over-deliver on transparency; keep a single shared definition of success.
