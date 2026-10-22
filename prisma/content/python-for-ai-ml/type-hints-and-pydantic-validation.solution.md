**Type hints** (`def f(x: int) -> str`) are annotations. CPython **does not enforce them**. They help editors, linters and static checkers (mypy, pyright), and serve as documentation.

**Pydantic** reads the hints and **validates and coerces data at runtime**, raising a structured `ValidationError` with field paths and messages. It also serialises to/from JSON and generates JSON Schema.

```python
from typing import Literal
from pydantic import BaseModel, Field

class Ticket(BaseModel):
    category: Literal["billing", "bug", "other"]
    priority: int = Field(ge=1, le=5)
    summary: str = Field(min_length=5)

Ticket.model_validate_json('{"category":"bug","priority":"3","summary":"App crashes"}')
# priority "3" is coerced to 3 in the default (lax) mode; pass strict=True to forbid coercion
```

**Where validation helps in LLM apps**
1. **LLM output:** model replies are text; parse and validate structured output (and retry with the error message on failure).
2. **API boundaries:** request bodies in FastAPI are Pydantic models, so malformed input becomes a 422, not a crash deep in your pipeline.
3. **Tool/function-call arguments:** the model may produce wrong types or missing fields; validate before executing anything with side effects.
4. **Config and environment:** `pydantic-settings` to fail fast on missing API keys or bad hyperparameters.

**Takeaway:** hints are for developers and tools; validation is for data you do not control.
