**Red teaming** is structured adversarial testing in which people (and automated tools) try to make the system fail or behave harmfully, to find weaknesses **before attackers or users do**. It complements benchmarks, which measure average behaviour, by hunting the worst case.

**1. Scope and threat model**

- System under test: model + system prompt + retrieval + tools + guardrails + UI (not just the base model).
- **Harm taxonomy:** safety (self-harm, weapons, illegal), toxicity/bias, privacy (PII, training data, system prompt leakage), security (prompt injection, tool abuse, data exfiltration, privilege escalation), misinformation/hallucination, brand/legal risk, domain-specific harms (medical, financial advice).
- **Adversaries:** curious users, malicious users, insiders, attackers poisoning documents/web pages.

**2. Team:** mix of security engineers, ML engineers, domain experts, policy/legal, and diverse testers (language, culture), with clear rules of engagement and wellbeing support.

**3. Methods**

- **Manual creative attacks:** role-play, hypotheticals, multi-turn escalation, persuasion, obfuscation (encoding, translation, typos), many-shot and context stuffing, persona jailbreaks.
- **Automated attacks:** LLM-generated adversarial prompts, search/gradient-style suffixes, fuzzing, mutation of known jailbreaks (tools: garak, PyRIT, promptfoo, Giskard, HarmBench-style suites).
- **System-level attacks:** indirect prompt injection via documents/web pages/emails, tool misuse, over-permissioned actions, cross-tenant data access, cost/DoS abuse.
- **Coverage of languages and modalities.**

**4. Measure:** attack success rate by category and severity, reproducibility, time to bypass, and which layer failed (model, prompt, filter, permission). Use a severity scale and risk matrix (impact x likelihood).

**5. Report and fix:** written findings with reproduction steps; remediation through prompt/policy changes, guardrails, **permissions and architecture (least privilege)**, fine-tuning/safety training, monitoring; **retest** after fixes.

**6. Make it durable:** add every successful attack to the **regression suite**, run automated red teaming in CI and before each release, set a bug-bounty or reporting channel, and repeat on major changes. Define **launch criteria** (e.g. no critical open issues; attack success below a threshold).

**Limitations:** red teaming shows the presence, not absence, of vulnerabilities; attackers adapt, so continuous testing and monitoring are required.
