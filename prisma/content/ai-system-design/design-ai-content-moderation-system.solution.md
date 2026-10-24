**Requirements:** millions of items per day, multiple modalities, policy categories (hate, violence, sexual, self-harm, spam, illegal), regional laws, pre-publish and post-publish checks, appeals, audit trail.

**Pipeline (tiered)**

```text
Content -> Fast filters (hash match vs known-bad [PhotoDNA-style], blocklists, rate/spam heuristics)
   -> ML classifiers per modality/policy (text, image, video, audio) -> scores
   -> LLM/VLM policy reasoner for ambiguous or context-dependent cases (policy text in prompt)
   -> Decision engine: allow / block / limit reach / age-gate / send to human review
   -> Human review queues (prioritised by severity, reach, confidence) -> labels back to training
   -> Actions + user notices + appeals workflow
```

**Design decisions**

- **Cascade for cost and latency:** cheap checks on everything; expensive models only for uncertain cases.
- **Thresholds per policy and market:** high-severity categories favour recall (accept some false positives plus human review); low-severity favour precision.
- **Policy as data:** versioned policy definitions drive prompts, labelling guides and evaluation; changes can roll out without retraining (LLM policy reasoning), and are tested on golden sets.
- **Context matters:** include thread, user history, and reporter signals; sarcasm, reclaimed slurs and news reporting need context.
- **Human-in-the-loop:** reviewer tooling, wellbeing protections for reviewers, double review for edge cases, quality audits.
- **Adversarial adaptation:** attackers obfuscate (leetspeak, images with text, coded language); retrain frequently, mine reports, red-team.
- **Fairness and transparency:** measure error rates across languages and groups, explain decisions to users, appeals with SLA, transparency reporting.

**Metrics:** precision/recall per policy, prevalence of violating content viewed, time to action, appeal overturn rate, reviewer agreement, cost per item, latency of pre-publish checks.
