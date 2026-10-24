**Guardrails = controls that constrain behaviour at several points in the pipeline.**

```text
user input -> [input guardrails] -> LLM -> proposed tool call -> [tool guardrails] -> tool -> [output guardrails] -> user
                                                          ^ policy engine, approvals, budgets
```

**1. Input guardrails**

- Detect prompt injection, jailbreak attempts, PII, off-topic or abusive content (classifiers, rules, moderation APIs).
- Authenticate the user and attach their permissions.

**2. Model / prompt-level guardrails**

- Clear system rules and scope; refusal examples; low temperature for action decisions. Helpful but **not sufficient** (they can be bypassed).

**3. Tool-call guardrails (most important, deterministic code)**

- **Allow-lists** of tools and arguments; schema validation; value limits (max refund amount, max recipients).
- **Authorisation** against the end user's rights; scoped credentials; read-only vs write.
- **Risk-based approval** for sensitive actions; **rate limits, budgets, step caps**.
- Dry-run/preview, idempotency keys, protection of critical resources (no `DROP`, no production writes).

```python
POLICY = {"send_email": {"max_recipients": 5, "domains": ["company.com"]},
          "issue_refund": {"max_amount": 100, "needs_approval_above": 50}}

def guard(call, user):
    rule = POLICY.get(call.name)
    if rule is None:                        raise Blocked("tool not allowed")
    if not user.can(call.name, call.args):  raise Blocked("not authorised")
    if call.name == "issue_refund" and call.args["amount"] > rule["max_amount"]:
        raise Blocked("amount above limit")
    return call
```

**4. Output guardrails**

- PII/secret redaction, toxicity and policy classifiers, groundedness checks, format validation, blocking exfiltration patterns.

**5. Monitoring and response:** log all decisions, alert on blocked attempts, kill switch, periodic red-team tests.

**Principle:** use model-based checks for fuzzy risks (toxicity, injection signals) and **hard-coded policies for anything with real consequences**. Measure both missed harms (false negatives) and over-blocking (false positives).
