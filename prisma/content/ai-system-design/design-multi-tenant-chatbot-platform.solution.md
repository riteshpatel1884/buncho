**Requirements:** self-serve onboarding, ingest websites/PDFs/help centres, embeddable widget/API/WhatsApp/Slack channels, per-tenant branding and behaviour, strict data isolation, usage-based billing, long tail of tiny tenants plus a few huge ones.

**Architecture**

```text
Tenant console -> Config service (persona, tone, allowed topics, escalation rules, languages, tools)
Ingestion (crawlers/uploads/connectors) -> parse -> chunk -> embed -> per-tenant namespace in vector DB + keyword index
Channels (web widget, API, messaging) -> Chat gateway (tenant auth via API key/domain, rate limits, quota)
   -> Orchestrator: load tenant config + memory -> retrieve (tenant namespace only) -> prompt assembly
   -> LLM (shared pool via AI gateway; model tier per plan) -> guardrails (scope, PII, brand safety) -> response + citations
   -> Escalation to human/ticketing -> Analytics (unanswered questions, CSAT, topics)
```

**Multi-tenancy decisions**

- **Isolation:** `tenant_id` derived server-side from credentials, enforced in a **single data-access layer**; namespaces/partitions per tenant in the vector store (dedicated indexes only for large or regulated tenants); per-tenant encryption keys for sensitive plans; automated cross-tenant leakage tests.
- **Configuration over code:** behaviour via prompts/config/tools stored per tenant; version and roll back configs; test chatbots before publishing (preview + eval set).
- **Shared compute:** a common inference pool with **per-tenant rate limits and budgets**; noisy-neighbour protection; plan-based model tiers.
- **Grounding and scope:** answer only from the tenant's content; "I don't know" + handoff otherwise; topic restrictions; prevent the bot from being used as a free general LLM or for brand-damaging output.
- **Ingestion at scale:** queue-based workers, incremental re-crawls, deduplication, per-tenant limits, retries; re-embedding on model upgrades through blue/green indexes.
- **Security:** prompt injection from crawled pages and visitor input, domain allowlists for the widget, abuse/spam controls, PII handling, GDPR deletion per tenant.
- **Analytics and improvement loop:** log unanswered or thumbs-down questions, suggest content to add, evaluate answer quality per tenant with sampled LLM judging.

**Cost model:** cache frequent questions per tenant, small models by default, tokens metered per tenant for billing.

**Metrics:** resolution/deflection rate per tenant, hallucination rate, isolation incidents (zero), p95 latency, cost per conversation, onboarding time.
