**Idea (Yao et al., 2023):** treat problem solving as **search over a tree of intermediate "thoughts"** rather than one left-to-right chain. The model can explore alternatives, evaluate them, and **backtrack**.

**Components**

1. **Thought generation:** from the current state, propose `k` candidate next steps.
2. **State evaluation:** the LLM scores each partial solution ("sure / maybe / impossible", or a number), or votes among them.
3. **Search algorithm:** breadth-first (keep best `b` states per level) or depth-first with pruning.
4. **Stopping:** a solution is found, or a budget is exhausted.

```python
def tree_of_thought(llm, problem, depth=3, k=3, beam=2):
    frontier = [""]                                   # partial solutions
    for _ in range(depth):
        candidates = [s + "\n" + t for s in frontier
                      for t in llm.propose(problem, s, n=k)]
        scored = sorted(candidates, key=lambda s: llm.score(problem, s), reverse=True)
        frontier = scored[:beam]
    return frontier[0]
```

**Evidence:** on the Game of 24 puzzle, GPT-4 with CoT solved about 4% of tasks while ToT solved about 74% in the original paper.

**Compared with CoT:** CoT commits to one path; ToT explores several and prunes. Compared with self-consistency, ToT searches *within* the reasoning and uses intermediate evaluation, not just a final vote.

**Use for:** puzzles, planning, creative writing with constraints, tasks where early mistakes are costly and partial progress can be judged.

**Costs:** many LLM calls (often 10 to 100x CoT), complexity of prompts and search code. For most business tasks, CoT, self-consistency or a reasoning model is more cost-effective.
