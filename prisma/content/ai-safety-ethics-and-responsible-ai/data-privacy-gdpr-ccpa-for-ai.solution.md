| Topic | **GDPR (EU/UK)** | **CCPA/CPRA (California)** |
|---|---|---|
| Scope | Any processing of EU residents' personal data | Businesses meeting thresholds handling California residents' data |
| Basis | Needs a **lawful basis** (consent, contract, legitimate interest...) | Notice at collection, opt-out of sale/sharing, limits on sensitive data use |
| Principles | Purpose limitation, **data minimisation**, accuracy, storage limitation, security, accountability | Notice, purpose limits, reasonable security |
| Rights | Access, rectification, **erasure**, restriction, portability, objection, **no solely automated decisions** with legal effect (Art. 22) + meaningful information about logic | Know, delete, correct, opt out, limit sensitive data use |
| Special data | Health, biometrics, politics etc. need explicit basis | Sensitive personal information rules |
| Governance | **DPIA** for high-risk processing, DPO, records of processing, breach notice in 72h | Risk assessments (evolving), service-provider contracts |
| Penalties | Up to 4% of global turnover / EUR 20M | Fines per violation, private action for breaches |

**Implications for AI engineering**

1. **Training data:** know provenance and lawful basis; scraped personal data is risky; honour opt-outs; minimise and de-identify; document in dataset sheets.
2. **Runtime data:** do not send personal data to third-party LLM APIs without a **DPA**, zero-retention terms, and region controls; redact PII before prompts/logs.
3. **Retention:** set TTLs for prompts, logs, vector stores and caches.
4. **User rights:** keep an index linking users to data in databases, vector stores, logs, and fine-tuning sets so access/erasure requests are actionable; consider unlearning limits.
5. **Automated decisions:** human review, explanations, appeal path.
6. **Security:** encryption, access control, tenant isolation, audit logs; guard against memorisation and prompt/output leakage.
7. **Privacy by design:** DPIA before launch, privacy-enhancing tech (differential privacy, federated learning, synthetic data), cross-border transfer mechanisms.

*Not legal advice; involve counsel for specific cases.*
