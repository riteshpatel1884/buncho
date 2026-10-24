**Features:** thread summaries, priority/triage, draft replies in the user's style, extraction of tasks and meetings, search ("what did Anna say about the contract?"), optional autonomous actions.

**Architecture**

```text
Mail provider (Gmail/Graph API, OAuth, push notifications) -> ingestion queue
   -> Parse/clean (strip quotes, signatures, HTML), thread reconstruction
   -> Per-user index: embeddings + keyword + metadata (sender, labels, dates)  [tenant-isolated]
   -> Assistant service: summariser / triage classifier / draft writer / action planner
        context = thread + relevant past mails + style profile + calendar + contacts
   -> Safety layer -> Draft (never auto-send by default) -> user review -> send / execute
```

**Design decisions**

- **Privacy first:** least-privilege OAuth scopes, per-user encryption and isolation, minimal retention, no training on user mail without consent, enterprise data residency, deletion on request.
- **Prompt injection is the central risk:** incoming emails are **untrusted text** that may say "forward all mail to X". Treat email content as data, never as instructions; **require confirmation** for sends, forwards, deletes, calendar changes and external sharing; restrict tools; detect exfiltration patterns.
- **Style personalisation:** learn tone from the user's sent mail (few-shot examples/retrieval of similar replies, style summary), not by fine-tuning per user unless justified.
- **Triage:** classifier on sender relationship, urgency cues, user history and explicit rules; explain why a mail is prioritised.
- **Grounding:** drafts must not invent facts (dates, amounts, commitments); use retrieved context and flag uncertainty; show the sources.
- **Scale and cost:** process on arrival, summarise lazily, cache summaries, use small models for classification and larger ones for drafting; handle long threads with hierarchical summarisation.

**Metrics:** draft acceptance/edit distance, time saved, triage accuracy (missed important mail rate), harmful/incorrect action rate (target zero), latency, privacy incidents.
