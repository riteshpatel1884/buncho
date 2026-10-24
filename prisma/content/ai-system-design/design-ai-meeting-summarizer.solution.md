**Requirements:** thousands of meetings per day (each 30 to 90 minutes), multiple platforms (Zoom/Meet/Teams), speaker attribution, summaries within minutes of ending, action items with owners/dates, permissions, privacy and consent.

**Pipeline**

```text
Calendar integration -> Meeting bot / platform API joins -> audio (and optional video/chat/shared screen)
   -> Streaming/batch ASR + diarisation (who spoke) + language ID -> transcript with timestamps
   -> Post-processing: punctuation, speaker naming (from participants list), glossary correction
   -> Summarisation: chunk transcript by topic/time -> map summaries -> reduce to final
        outputs: overview, decisions, action items (owner, due date), open questions, key quotes with timestamps
   -> Quality checks (grounding, owner/date validation) -> Delivery (email/Slack/app), search index, CRM/task sync
```

**Design decisions**

- **Long inputs:** a 1-hour meeting is about 8,000 to 10,000 words (roughly 12K+ tokens); long-context models can take it whole, but **map-reduce / hierarchical summarisation** is cheaper, more robust to errors and gives per-topic notes. Keep timestamps so each bullet links back to the recording.
- **Grounding:** extract action items with the **quote and timestamp** as evidence; do not invent owners or dates ("unassigned" if absent).
- **Speaker attribution:** diarisation + matching to participants (voice enrolment or meeting platform speaker events); errors here misassign tasks, so show confidence.
- **Custom vocabulary:** names, product terms and acronyms injected into ASR and summarisation prompts.
- **Scale and cost:** queue-based pipeline; batch ASR on GPU workers (cheaper than real-time for post-meeting needs); use smaller models for first-pass summaries; cache; process in priority order (paid, upcoming follow-ups).
- **Privacy and compliance:** recording consent and notices (varies by jurisdiction), tenant isolation, encryption, retention policies, redaction of sensitive data, access controls (only attendees see notes), no training on customer data by default.
- **Reliability:** reconnect/resume if the bot is dropped, fallback to uploaded recordings, idempotent jobs, dead-letter queues.

**Evaluation:** ASR word error rate and diarisation error rate, summary faithfulness (LLM judge + human sampling), action-item precision/recall vs human notes, user edit rate, time-to-summary, cost per meeting hour.
