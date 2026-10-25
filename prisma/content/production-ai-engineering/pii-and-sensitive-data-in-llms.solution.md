**Map the data flow first:** user input, prompts, retrieved documents, tool results, model provider, logs/traces, caches, vector stores, analytics, fine-tuning data, backups. PII can leak at any hop.

**Controls**

1. **Data minimisation:** send only what the task needs; avoid putting entire records in prompts; classify data (public, internal, confidential, regulated).
2. **Detection and redaction before the model:** regex/validators (emails, phones, card numbers with Luhn, IDs), NER models or services (Microsoft Presidio, cloud DLP) to find names, addresses and health data.
   - **Redact** (`[EMAIL]`) when meaning is not needed.
   - **Pseudonymise/tokenise** (`<PERSON_1>`) with a secure mapping so the response can be **re-hydrated** afterwards.
3. **Choose the processing location:** providers with zero-data-retention and no-training terms, enterprise agreements/BAAs (HIPAA), regional processing (GDPR residency), or **self-hosted/VPC models** for highly sensitive data.
4. **Output controls:** scan responses for PII/secrets and memorised data, block or redact, avoid exposing other users' data (strict tenant isolation in retrieval and caches, ACL filtering).
5. **Logging and storage:** redact before logging, encrypt at rest and in transit, short retention, restricted access, separate sensitive traces; scope vector stores and caches per tenant.
6. **Training and fine-tuning:** exclude or anonymise PII, deduplicate, consent and licensing checks; memorisation tests; consider differential privacy for high-risk cases.
7. **Access control and audit:** least privilege for people and services, audit trails, DSAR/deletion workflows (find and delete a user's data across stores, including embeddings and caches).
8. **Security threats:** prompt injection that tries to exfiltrate data, over-permissive tools, logs exposed to third parties.

```python
masked, mapping = pseudonymise(user_text)        # {"<PERSON_1>": "Asha Rao"}
reply = llm(masked)
final = rehydrate(reply, mapping)               # restore names only for the authorised user
```

**Governance:** DPIAs, data processing agreements, regional compliance (GDPR, CCPA, HIPAA, India's DPDP), user notices and consent, regular red-team tests for leakage.

**Limitations:** detection is imperfect (false negatives), so combine with minimisation and architectural isolation rather than relying on filters alone.
