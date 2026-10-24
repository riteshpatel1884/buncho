**Idea:** after producing an answer or taking actions, the agent **evaluates its own output, finds problems, and revises**. This turns one-shot generation into an iterate-and-improve loop.

**Patterns**

1. **Generate-critique-revise:** draft, then critique against criteria (correctness, completeness, style), then rewrite. Repeat 1 to 3 times.
2. **Separate critic (actor-critic):** a second prompt or model reviews the first (often a different persona or stronger model) to reduce shared blind spots.
3. **Reflexion (Shinn et al., 2023):** after a failed attempt, the agent writes a **verbal reflection** on what went wrong, stores it in memory, and uses it in the next attempt.
4. **Tool-grounded reflection:** feedback from tests, compilers, validators or search results rather than opinion alone.
5. **Reflection on the plan:** check whether the plan still fits the evidence before continuing.

```python
def reflect_loop(task, llm, checker, max_rounds=3):
    draft = llm(task)
    for _ in range(max_rounds):
        feedback = checker(draft)                 # tests, schema, or LLM critique
        if feedback.ok:
            return draft
        draft = llm(f"{task}\n\nPrevious attempt:\n{draft}\n\nProblems found:\n{feedback.text}\nFix them.")
    return draft
```

**Benefits:** higher accuracy on coding, maths, writing and multi-step tasks; catches formatting and logic errors; learns across attempts.

**Limits**

- **Self-critique without external signal is unreliable:** models often cannot find their own reasoning errors, or "fix" correct answers into wrong ones.
- More tokens and latency; diminishing returns after a few rounds; risk of endless polishing.
- The critic can share the generator's bias.

**Best practice:** ground reflection in **objective checks** (tests, retrieval, rules), use specific rubric-style critique prompts, cap iterations, and measure that reflection improves your metric.
