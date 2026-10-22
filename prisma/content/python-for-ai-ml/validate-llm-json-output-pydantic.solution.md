```python
import re
from typing import Literal
from pydantic import BaseModel, Field, ValidationError

class Ticket(BaseModel):
    category: Literal["billing", "bug", "other"]
    priority: int = Field(ge=1, le=5)
    summary: str = Field(min_length=5)

def strip_fences(raw: str) -> str:
    m = re.search(r"```(?:json)?\s*(.*?)```", raw, re.DOTALL)
    return (m.group(1) if m else raw).strip()

def extract_ticket(llm, text, retries=2):
    base = (f"Return ONLY a JSON object with keys category (billing|bug|other), "
            f"priority (1-5), summary.\n\nTicket:\n{text}")
    prompt, last_err = base, None
    for _ in range(retries + 1):
        raw = llm(prompt)
        try:
            return Ticket.model_validate_json(strip_fences(raw))
        except ValidationError as e:
            last_err = e
            prompt = (f"{base}\n\nYour previous reply was invalid:\n{raw}\n\n"
                      f"Errors:\n{e}\n\nReturn ONLY the corrected JSON.")
    raise ValueError(f"No valid output after {retries + 1} attempts") from last_err
```

**Why this design**
- `model_validate_json` handles both JSON syntax errors and schema errors (types, ranges, allowed values) and raises `ValidationError` with field-level messages.
- Feeding the error and the bad output back gives the model what it needs to self-correct. Cap retries to bound cost and latency.
- Fences are common even when instructed otherwise, so strip them defensively.

**Better when available:** use the provider's **structured output / JSON-schema mode or tool calling** with `Ticket.model_json_schema()`, which constrains decoding and cuts failures sharply. Still validate the result, because schema-valid output can be semantically wrong, and log validation failure rates as a quality metric. Never execute actions from unvalidated output.
