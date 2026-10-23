**Definition:** a reusable prompt with **fixed instructions** and **placeholders** filled at runtime with variables (user input, retrieved context, examples, dates).

**Design principles**

1. **Clear sections** in a stable order: role, task, constraints, context, examples, input, output format.
2. **Delimit untrusted input** with tags (`<document>...</document>`) and tell the model to treat it as data; escape or strip delimiters in user text.
3. **Explicit output contract** (schema, allowed values, what to do when unsure).
4. **Stable prefix first** (cache-friendly), variable parts last.
5. **Parameterise** instead of string-hacking: separate templates per task, language and model if they behave differently.
6. **Validate inputs** (length limits, required variables) before rendering and trim context to a token budget.
7. **Version and review** templates like code; keep them in files, not scattered in strings.

```python
from string import Template

CLASSIFY_V3 = Template("""You are a support triage assistant.
Allowed categories: $categories. If unsure, answer "other".
Return JSON: {"category": str, "confidence": number}.

<ticket>
$ticket
</ticket>""")

def render(ticket: str, categories: list[str]) -> str:
    if len(ticket) > 4000:
        ticket = ticket[:4000]
    return CLASSIFY_V3.substitute(ticket=ticket.replace("</ticket>", ""), categories=", ".join(categories))
```

**Testing and operations**

- Golden test set per template with expected outputs or a scoring rubric; run in CI on every change.
- Log template id and version with each request; roll back quickly; A/B test new versions.
- Track format-validity rate, accuracy, tokens and cost.
