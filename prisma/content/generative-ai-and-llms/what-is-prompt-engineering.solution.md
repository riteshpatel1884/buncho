**Definition:** designing and refining the input given to an LLM so that it produces accurate, consistent, safe output for a task, **without changing the model weights**.

**Why it is critical**

- The model is a general next-token predictor; the prompt is how you specify the task, format, tone and constraints.
- Quality, cost and latency depend heavily on it: a clear prompt can beat a larger model with a vague one.
- It is the cheapest lever: no training data or GPUs, and changes ship instantly.
- It is part of the product's behaviour and security surface (injection, leakage), so it needs versioning, testing and review like code.

**Anatomy of a good prompt**

| Part | Example |
|---|---|
| Role / context | "You are a support agent for ACME Bank." |
| Task | "Classify the ticket into one category." |
| Input data (delimited) | `<ticket>...</ticket>` |
| Constraints | "Use only the listed categories. If unsure, return `other`." |
| Examples | 2 to 3 input/output pairs |
| Output format | "Return JSON: {category, confidence}" |

```python
prompt = f"""You are a support triage assistant.
Classify the ticket into: billing, shipping, technical, other.
Return JSON {{"category": str}} only.

<ticket>{ticket_text}</ticket>"""
```

**Limits:** prompting cannot add knowledge the model lacks (use RAG) or fix deep capability gaps (use a stronger model or fine-tuning). Treat prompts as code: version control, an eval set, and regression tests.
