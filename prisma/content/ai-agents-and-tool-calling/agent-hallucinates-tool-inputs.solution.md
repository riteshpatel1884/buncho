**Classify the failures on 50 traces:** (a) calls a nonexistent tool or feature; (b) right tool, wrong or missing parameter; (c) parameter value invented (id, date format); (d) wrong tool chosen.

**Causes**

- Vague tool descriptions or schemas (free-text fields, no formats, no enums).
- Missing information in the context (the id was never retrieved, but the model fills in a plausible value).
- Too many similar tools; prompt that implies capabilities the system lacks.
- Model not strong enough for the number of tools or complexity of schemas.

**Fixes**

1. **Tighten schemas:** types, enums, regex patterns, formats (`date: YYYY-MM-DD`), required fields, constraints (`minimum`, `maxItems`), descriptions with examples; **strict mode / constrained decoding** where supported.
2. **Validate in code** before execution; on failure return an **actionable error**: `"attendee_id 'A99' not found. Use find_person(name) to get a valid id."`
3. **Make required values obtainable:** provide lookup tools (search by name -> id); tell the agent "never invent ids; always look them up".
4. **Resolve relative values in code:** pass `today` in context and accept `"next friday"` through a parsing step (or have the model output ISO dates with the current date given).
5. **State capabilities honestly:** a short list of what the agent can and cannot do ("cannot export PDFs; offer the text instead"); a refusal path for unsupported requests.
6. **Reduce tool count per step:** tool retrieval/routing, group by task, or subagents with focused toolsets.
7. **Few-shot examples** of correct calls, including a refusal example.
8. **Ask for missing parameters** instead of guessing (a `clarify` step).
9. **Evaluate:** tool-call accuracy set with expected name and arguments; track invalid-call rate and invented-parameter rate; add failures as regression tests.

```python
def execute(call):
    if call.name not in TOOLS:
        return {"error": "unknown_tool", "available": list(TOOLS)}
    errors = validator(TOOLS[call.name].schema).validate(call.args)
    if errors:
        return {"error": "invalid_arguments", "details": errors}
    return TOOLS[call.name].run(**call.args)
```
