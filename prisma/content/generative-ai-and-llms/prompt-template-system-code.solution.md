```python
import re

class PromptTemplate:
    VAR = re.compile(r"\{\{\s*(\w+)\s*\}\}")            # {{ name }}

    def __init__(self, template: str, defaults: dict | None = None):
        self.template = template
        self.defaults = defaults or {}
        self.variables = set(self.VAR.findall(template))

    def render(self, **values) -> str:
        merged = {**self.defaults, **values}
        missing = self.variables - merged.keys()
        if missing:
            raise ValueError(f"Missing variables: {sorted(missing)}")
        extra = merged.keys() - self.variables
        if extra:
            raise ValueError(f"Unknown variables: {sorted(extra)}")
        return self.VAR.sub(lambda m: str(merged[m.group(1)]), self.template)

qa = PromptTemplate(
    "You are a {{ role }}.\nAnswer using only the context.\n\n"
    "<context>\n{{ context }}\n</context>\n\nQuestion: {{ question }}",
    defaults={"role": "support assistant"},
)
print(qa.render(context="Refunds take 5 days.", question="How long do refunds take?"))
```

**Why a single-pass regex:** the substituted values are **not re-scanned**, so a user typing `{{ context }}` cannot trigger further substitution, and braces in JSON examples inside values stay untouched (unlike `str.format`).

**Good practices**

- **Fail loudly** on missing or unknown variables; silent blanks cause subtle bugs.
- **Delimit untrusted input** (XML tags, fenced blocks) and tell the model to treat it as data; escape closing tags in user text.
- Keep templates in files with **versions** and tests (see prompt versioning).
- Enforce a **length budget** per variable (truncate long context).
- For production, libraries such as Jinja2 add loops/conditionals; use a sandboxed environment if templates are not fully trusted.
