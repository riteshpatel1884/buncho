**Requirements:** resolve common issues automatically, escalate safely, integrate with CRM/order/billing systems, multi-channel (chat, email, voice), auditable.

**Architecture**

```text
Channel adapters -> Session manager (identity, history, language)
   -> Triage/Router agent (intent, urgency, sentiment, risk)
        -> Specialist agents: Knowledge (RAG over help docs/policies),
           Order/Billing (tools: lookup, refund within limits),
           Technical (diagnostics, runbooks), Account (verified actions)
   -> Supervisor/Policy layer (guardrails, approvals, tone) -> Reply
   -> Escalation: human queue with summary, context and suggested reply
```

**Design decisions**

- **Why multi-agent:** separate prompts, tools and permissions per domain (least privilege), easier evaluation and updates. Start with a **router + specialist tools**; add true agents only where autonomy pays off.
- **Tools** are typed APIs with permissions; **write actions** (refunds, cancellations) have limits and require approval above thresholds.
- **Authentication first:** verify the customer before account data or actions.
- **Grounding:** answers from the knowledge base with citations; if unsupported, say so and escalate.
- **Escalation triggers:** low confidence, negative sentiment/repeated failure, legal/safety keywords, high-value or irreversible actions, explicit request for a human. Hand off a **summary and structured context** so the customer does not repeat themselves.
- **Shared state** (case object): intent, entities, steps taken, tool results.
- **Guardrails:** PII redaction, policy checks, refusal for out-of-scope, prompt-injection resistance for customer-provided text and tickets.

**Reliability:** timeouts and retries on tools, idempotent actions, loop/step budgets, fallbacks to a human queue if the system is degraded.

**Metrics:** containment/resolution rate, first-contact resolution, CSAT, escalation precision (needed vs unnecessary), handle time, wrong-action rate, hallucination rate, cost per ticket. Evaluate with replayed historical tickets and shadow mode before autonomy.
