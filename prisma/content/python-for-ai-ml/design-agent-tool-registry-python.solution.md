**Developer experience.** A decorator registers a typed function; docstring and type hints become the tool description and schema.

```python
from pydantic import BaseModel, Field

class SearchArgs(BaseModel):
    query: str = Field(description="Search text")
    limit: int = Field(5, ge=1, le=20)

@registry.tool(name="search_docs", args=SearchArgs, side_effects=False)
async def search_docs(args: SearchArgs) -> list[dict]:
    """Search internal documentation. Use for questions about company policy."""
    ...
```

**Components**
1. **Tool spec:** name, description (from docstring), Pydantic args model, flags (`side_effects`, `requires_approval`, `timeout`, `required_scopes`), and the callable. The **JSON Schema is generated** with `ArgsModel.model_json_schema()`, so schema and code cannot drift.
2. **Registry:** dictionary of name to spec; rejects duplicate names; can export the tool list for any provider format; supports per-agent subsets so each agent sees only the tools it needs (fewer, clearly distinct tools reduce wrong-tool errors).
3. **Dispatcher:** receives the model's tool call, then
   - looks up the tool (unknown name returns a structured error to the model),
   - **validates arguments** with Pydantic (never trust model output),
   - checks permissions and approval policy for side-effecting tools (human-in-the-loop for destructive actions),
   - runs it with a **timeout** and exception capture (`asyncio.wait_for`; sync tools via `asyncio.to_thread`),
   - truncates oversized results, redacts sensitive fields, and returns a **uniform result envelope** `{ok, data | error{type, message}}`.
4. **Errors as feedback:** validation errors are returned to the model in readable form so it can correct itself, with a retry cap. Distinguish "tool failed" from "no results", because an empty result must not look like an error.
5. **Observability:** log tool name, validated args (redacted), duration, outcome and retry count; trace each step of the agent loop.

**Safety and design points**
- Idempotency keys for side-effecting tools; dry-run mode; least-privilege credentials per tool, not one shared admin token.
- Guard against prompt injection in tool outputs (treat results as untrusted data and never as instructions); validate and constrain arguments like file paths and SQL.
- Version tools so a changed schema does not break stored conversations.

**Testing.** Unit-test each function directly; test the dispatcher with a fake model that emits scripted tool calls (valid, invalid, unknown tool, timeout); snapshot-test the generated schemas; evaluate end-to-end tool selection accuracy on a labelled set of prompts.

**Trade-offs.** Decorator magic is convenient but can hide behaviour: keep explicit registration available. Strict validation increases retries but prevents bad side effects. More tools means more capability and more confusion for the model, so group or route them.
