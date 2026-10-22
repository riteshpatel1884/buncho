Compare `@dataclass`, `typing.NamedTuple`, `typing.TypedDict` and `pydantic.BaseModel`.

1. What does each give you, and what does it cost?
2. Which would you use for: an internal training config, a row of results returned by a function, JSON from an LLM, and a high-volume inner-loop record?
3. Why does `@dataclass` reject `tags: list = []`?
