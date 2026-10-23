**Why CoT may not help**

- The task is not multi-step (lookup, classification, pattern matching): extra text adds cost and sometimes error.
- The model is **too small** to produce reliable reasoning, or it is already a **reasoning model** that thinks internally (manual CoT is redundant and can hurt).
- Reasoning steps are **wrong**: calculation errors, misread facts, invalid logic. A confident chain of wrong steps leads to wrong answers.
- Missing knowledge: reasoning cannot invent facts.
- Bad prompt: steps are vague, the answer is not clearly separated, or the answer extraction is buggy (you parse the wrong number).
- Truncation by `max_tokens` before the final answer.

**Diagnose:** sample 30 failures; label where the chain first goes wrong (comprehension, fact, calculation, logic, format). Compare against a stronger model and against no-CoT to see what actually changes.

**Fixes (by cause)**

| Cause | Fix |
|---|---|
| Calculation errors | Use a calculator or code interpreter tool (program-of-thought) |
| Missing facts | Add retrieval or provide the context |
| Single bad chain | **Self-consistency** (vote over several chains), or verify then revise |
| Weak steps | Few-shot CoT with high-quality worked examples matching your problem type; structured steps ("1. restate, 2. list known values, 3. compute, 4. check") |
| Answer extraction bug | Fixed tags: `<reasoning>` then `<answer>`; parse only the answer; raise `max_tokens` |
| Model capacity | Switch to a stronger or reasoning model; use its effort/budget setting instead of manual CoT |
| Wrong task type | Remove CoT for simple tasks |
| Decomposable task | Prompt chaining: one step per call with validation |

**Verify:** compare accuracy, cost and latency for: no CoT, CoT, CoT + self-consistency, tool use, stronger model, on the same eval set.

```python
out = llm(f"{question}\nThink inside <reasoning> tags, then give only the final value in <answer> tags.")
answer = re.search(r"<answer>(.*?)</answer>", out, re.S).group(1).strip()
```
