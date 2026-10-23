**Use layers, from cheapest to strongest**

1. **Better prompt:** state the schema, give 1 to 3 examples, say "return only JSON", put format instructions at the end, lower temperature.
2. **Native structured output / function calling:** most APIs accept a JSON schema or tool definition and guarantee schema-conformant output.
3. **Constrained decoding** (self-hosted): grammars/JSON-schema masks (Outlines, llama.cpp grammars, vLLM guided decoding) set the logits of invalid tokens to `-inf`, so invalid JSON cannot be generated.
4. **Validate and repair:** parse with Pydantic; on failure, send the error back and retry once or twice.
5. **Fallbacks:** default value, simpler prompt, or human review if retries fail.

```python
from pydantic import BaseModel, ValidationError

class Ticket(BaseModel):
    category: str
    priority: int
    summary: str

def get_ticket(prompt, llm, retries=2):
    msg = prompt
    for _ in range(retries + 1):
        raw = llm(msg)
        try:
            return Ticket.model_validate_json(raw)
        except ValidationError as e:
            msg = f"{prompt}\n\nYour last output was invalid: {e}. Return only valid JSON."
    raise RuntimeError("could not get valid output")
```

**Monitor:** track parse-failure rate per prompt version and model; keep a regression set of tricky inputs.
