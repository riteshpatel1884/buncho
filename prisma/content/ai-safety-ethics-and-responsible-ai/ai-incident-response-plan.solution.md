**Scope (AI incident types):** harmful or unsafe outputs, bias/discrimination, privacy leaks, hallucination-driven wrong decisions, prompt-injection/data exfiltration, model/data poisoning, misuse, severe drift or quality collapse, provider model change, outages.

**1. Prepare**

- **Inventory** systems with owners, risk tier, dependencies, kill switches.
- **Roles:** incident commander, technical lead (ML/platform), safety/trust lead, legal/privacy (DPO), communications, customer support, executive sponsor. On-call rota.
- **Severity matrix:** e.g. SEV1 = safety harm, legal exposure or mass impact; SEV2 = significant harm/degradation; SEV3 = limited. Define response times and escalation paths.
- **Runbooks and tools:** feature flags, model rollback, prompt/version pinning, guardrail toggles, traffic shedding, human-fallback modes, log search.

**2. Detect:** monitoring (quality, safety classifier rates, drift, cost spikes), user reports and appeals, red-team findings, vendor notices, social media/press monitoring.

**3. Triage and contain (first hour):** classify severity, assemble team, **stop the bleeding** (disable feature, tighten filters, roll back, route to humans), preserve evidence (logs, prompts, model versions).

**4. Investigate:** reproduce, scope affected users and time window using audit logs, find root cause (data, model, prompt, retrieval, tool, vendor, process).

**5. Remediate and recover:** fix, retest with the failing cases plus regression suite, staged re-release with monitoring, remediate harm to users (corrections, compensation, deletion).

**6. Communicate:** internal updates, customer notices, **regulatory notification** where required (GDPR 72h for personal-data breaches; EU AI Act serious incidents; sector rules).

**7. Learn:** blameless post-mortem, action items with owners and dates, new tests and guardrails, update risk register, and run **tabletop exercises** regularly.
