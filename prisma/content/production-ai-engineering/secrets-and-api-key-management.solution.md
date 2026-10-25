**Principles:** never expose secrets to untrusted code or users, give each secret the **least privilege**, make them **short-lived and rotatable**, and detect misuse quickly.

**Storage and distribution**

- Use a **secrets manager** (AWS Secrets Manager, GCP Secret Manager, Azure Key Vault, HashiCorp Vault, Doppler), not code, `.env` files in repos, container images, or client apps. Load at runtime via environment injection or the platform's secret mounts.
- **Never ship provider keys to browsers or mobile apps**: route through your backend or a **gateway**, which authenticates users and applies quotas. If the client must talk to a provider, use **ephemeral/scoped tokens** minted by your server.
- Prefer **workload identity / IAM roles** and OIDC (no static keys) for cloud-hosted models; use **short-lived credentials**.
- Separate keys per environment (dev/staging/prod), per service and per tenant/use case, with **spend limits and quotas** and allowed models/IPs where supported, to limit the blast radius and enable cost attribution.

**Operations**

- **Rotate** regularly and immediately on suspicion; support dual-key rollover without downtime.
- **Secret scanning** in CI and pre-commit (gitleaks, TruffleHog, GitHub secret scanning); scan logs and traces so keys and tokens never get logged (redaction in observability pipelines).
- Monitor usage anomalies (spikes, unusual regions/models), set billing alerts, and have a revoke runbook.
- Restrict who can read secrets (RBAC, audit logs, break-glass access).

**LLM-specific risks**

- **Secrets in prompts or context:** do not put API keys, passwords or tokens in system prompts or documents: they can be exposed through **prompt injection or leakage** ("print your instructions").
- **Agents and tools:** give tools their own scoped credentials, never the model direct access to raw secrets; execute tool calls server-side with credentials the model cannot read; sandbox code execution without environment secrets; use per-user delegated tokens (OAuth) with minimal scopes and human approval for high-risk actions.
- **Generated code and logs:** coding agents may print or commit secrets; apply secret filters and pre-commit scanning.
- **Third-party plugins/MCP servers:** vet them, isolate credentials, and use least-privilege tokens.

**Checklist:** secrets manager, no keys in clients, per-service scoped keys with limits, rotation, scanning, redacted logs, gateway-mediated access, agent credential isolation.
