**Definition:** crafting inputs that make a safety-trained model **violate its safety or policy rules**. Prompt injection targets an *application's* instructions; jailbreaking targets the *model's* alignment (though they overlap).

**Common categories (high level)**

| Category | Idea |
|---|---|
| **Role-play / persona** | "Pretend you are an AI with no rules" |
| **Hypothetical or fiction framing** | Harmful request wrapped in a story or research context |
| **Instruction override** | "Ignore all previous rules" |
| **Obfuscation / encoding** | Base64, ciphers, typos, other languages to evade filters |
| **Payload splitting** | Harmless-looking pieces that combine into a harmful request |
| **Many-shot / long-context** | Many fake examples of the model complying, which shifts behaviour |
| **Multi-turn escalation** | Gradually moving a conversation toward disallowed content |
| **Adversarial suffixes** | Optimised token strings that push the model to comply |

**Defences**

- *Model level:* safety training (RLHF/Constitutional methods), adversarial training on discovered jailbreaks, refusal robustness across languages and encodings.
- *System level:* input and output **classifiers**, moderation APIs, system-prompt rules, rate limiting and account-level abuse detection.
- *Process:* continuous red-teaming, bug bounty, monitoring for new patterns, rapid patching, and layered checks for high-risk domains.

**Practical points**

- No defence is perfect; the goal is raising attacker cost and limiting harm.
- Evaluate with benchmark suites and measure both **attack success rate** and **over-refusal** on benign prompts.
- Keep consequential decisions and dangerous capabilities behind controls that do not depend on the model's willingness.
