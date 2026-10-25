**Guardrails** are controls around an LLM that keep inputs and outputs within safety, security, policy and quality boundaries. They do not replace a well-aligned model; they add defence in depth.

**Layers**

```text
User input -> [Input guardrails] -> LLM (+ tools, retrieval) -> [Output guardrails] -> User
                  |                      |  [Tool/action guardrails]                     |
             block / sanitise      restrict permissions, validate args             block / redact / regenerate / refuse
```

**1. Input guardrails:** prompt-injection and jailbreak detection, topic and scope checks, PII/secret detection, toxicity, length limits, language checks, rate limiting and abuse detection.

**2. Output guardrails (content filtering):** toxicity, hate, sexual, violence and self-harm classifiers; PII/secret leakage; **groundedness** (is the answer supported by retrieved context?); schema/format validation; brand and policy rules; competitor or off-topic mentions; citation checks.

**3. Action guardrails (agents):** tool allowlists, argument validation, spending/volume limits, human approval for irreversible actions, sandboxed execution.

**Techniques**

- **Rules and regex/validators:** fast and exact for PII patterns, banned terms, schemas.
- **Classifiers:** moderation APIs, Llama Guard, Prompt Guard, ShieldGemma, Azure/Bedrock guardrails, custom fine-tuned models.
- **LLM-as-judge** for nuanced policy checks (slower, costlier).
- **Constrained decoding** for structure; **system prompts** for behaviour (weakest layer alone).
- Frameworks: NeMo Guardrails, Guardrails AI, cloud guardrail services.

**Handling a violation:** block with a safe message, redact, **regenerate** with stricter instructions, route to a human, log for review.

**Engineering concerns**

- **Latency:** run input checks in parallel with generation where safe; stream with sentence-level output checks (buffering); use cheap checks first.
- **Tune thresholds on labelled data:** balance false positives (annoyed users) vs false negatives (harm), different thresholds per risk level.
- **Test with red-teaming** and adversarial suites; update as attacks evolve.
- **Monitor** trigger rates and review a sample of blocks and passes; guardrails drift too.
- Defence in depth: least-privilege data access matters more than any filter.
