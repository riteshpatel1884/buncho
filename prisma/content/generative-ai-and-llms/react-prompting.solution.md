**Idea (Yao et al., 2022):** interleave **reasoning** (thoughts) with **actions** (tool calls) and **observations** (tool results). Reasoning plans and interprets; actions fetch facts or change the world. This reduces hallucination and enables multi-step tasks.

**Loop:** `Thought -> Action -> Observation -> Thought -> ... -> Final Answer`

```text
Question: Who is older, the director of "Inception" or of "Dunkirk"?
Thought: Both films are by the same director, so I need his birth date only to confirm.
Action: search("Inception director")
Observation: Christopher Nolan.
Thought: Dunkirk is also by Nolan, so they are the same person.
Final Answer: They are the same person, so neither is older.
```

```python
def react(llm, tools, question, max_steps=6):
    scratch = f"Question: {question}\n"
    for _ in range(max_steps):
        out = llm(REACT_PROMPT + scratch, stop=["Observation:"])
        scratch += out
        if "Final Answer:" in out:
            return out.split("Final Answer:")[-1].strip()
        name, arg = parse_action(out)                 # e.g. search("...")
        scratch += f"\nObservation: {tools[name](arg)}\n"
    return "No answer within step limit."
```

**Compared with CoT:** CoT reasons only from the model's memory (can hallucinate facts); ReAct grounds each step in tool observations. Modern function-calling APIs implement the same loop natively.

**Failure modes:** wrong tool or arguments, looping, ignoring observations, prompt injection through tool outputs, runaway cost. Mitigate with step limits, tool descriptions, validation, allow-lists and tracing every step.
