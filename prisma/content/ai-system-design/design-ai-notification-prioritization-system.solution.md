**Problem:** blasting every event to every user causes fatigue, opt-outs and lost trust. The goal is to send **fewer, more relevant, well-timed** notifications.

**Architecture**

```text
Event sources (product events, messages, alerts, marketing) -> Candidate notifications (with metadata: type, urgency, expiry)
   -> Eligibility filters (user settings, quiet hours, consent, legal, dedupe, frequency caps)
   -> Scoring: P(open/engage), P(value), P(unsubscribe/mute) per user x notification x time x channel
   -> Decision policy: send now / delay to best time / batch into digest / drop; channel choice (push, email, in-app, SMS)
   -> Delivery (provider APIs, rate limits, retries) -> Feedback (delivered, opened, acted, muted) -> training data
```

**Design decisions**

- **Urgency tiers:** critical (security, payments, safety) bypass optimisation (subject to user settings); time-sensitive social/transactional get fast delivery; low-priority content is digested or delayed.
- **Value model:** multi-objective ranking predicting engagement benefit minus **fatigue cost** (recent volume, ignored rate, unsubscribe risk). Use per-user notification budgets (e.g. N per day) allocating slots to the highest-value items.
- **Timing optimisation:** learn per-user active hours; **send-time optimisation** with contextual bandits; respect time zones and quiet hours.
- **Personalised content:** LLMs generate or rewrite titles/summaries (short, relevant, safe), with templates and guardrails for critical messages; avoid manipulative or misleading copy.
- **Aggregation:** collapse 20 likes into one summary; thread similar events.
- **Cold start and exploration:** default rules for new users; controlled exploration to keep learning without annoying users.
- **Controls and trust:** easy preferences, transparent reasons ("because you follow X"), honouring opt-outs and regulations (consent, CAN-SPAM, TCPA).
- **Evaluation:** online experiments with holdout groups measuring **long-term retention, opt-out rate and overall engagement**, not only click-through (short-term CTR optimisation can harm long-term value); shadow-mode policy evaluation using logged propensities.

**Reliability:** idempotent delivery, deduplication across channels, fallbacks when the scoring service is down (conservative rules), provider throttling.
