**Common failure modes and fixes**

| Symptom | Likely cause | Fix |
|---|---|---|
| Ignores an instruction | Buried, conflicting or too many instructions | Shorten, prioritise, repeat critical rule at the end, resolve conflicts |
| Wrong format | Format not specified or no example | Schema, examples, structured-output mode, validation and retry |
| Hallucination | No grounding, pressure to answer | Provide context (RAG), allow "I don't know", require citations |
| Inconsistent answers | High temperature, ambiguous task, varied examples | Lower temperature, define labels precisely, fix few-shot examples |
| Verbose or off-topic | Missing scope and length limits | State length, audience, scope |
| Misses details in long input | Long context, "lost in the middle" | Shorten, reorder, chunk, quote relevant parts first |
| Wrong reasoning | Needs steps or tools | CoT, calculator or code tool, verification step |
| Leaks or follows injected text | Untrusted data mixed with instructions | Delimiters, least privilege, filters |
| Works in testing, fails in prod | Template rendering bug, truncated context, different inputs | Log the final prompt, test on real data |

**Debugging workflow**

1. **Reproduce** with the exact final prompt and parameters (model, temperature); collect 20+ failing cases.
2. **Classify failures** (error analysis) to find the dominant cause.
3. **Inspect the full prompt** including retrieved context, history and truncation.
4. **Isolate:** remove parts of the prompt; try a stronger model; try temperature 0. If a stronger model fixes it, it is a capability issue; otherwise a prompt/data issue.
5. **Ask the model** to explain its interpretation (treat as a hint, not proof).
6. **Fix one thing**, re-run the full eval set to check for regressions.
7. **Add the failures to the regression suite.**

```python
log = {"template": "v3", "model": MODEL, "temperature": 0, "final_prompt": prompt, "output": out}
```
