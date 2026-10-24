**Why loops happen**

- A tool returns **no new information** (empty or ambiguous results) and the agent has no alternative path.
- Tool errors with unclear guidance ("failed"), so the model retries the same thing.
- No clear **stop criterion**, or the goal is impossible with the available tools.
- Context truncation: the agent forgets it already tried something.
- Conflicting instructions or oscillating plans (A then B then A).
- Low temperature plus identical inputs make the same output deterministic.

**Detect**

- **Repeated calls:** same tool and arguments (hash) seen N times.
- **Cycle in state:** repeated sequence of calls or near-identical messages (similarity).
- **No progress:** no new facts, files changed or sub-goals completed over K steps.
- **Budget/step/time thresholds.**

```python
from collections import Counter

class LoopGuard:
    def __init__(self, max_repeat=3, max_steps=25):
        self.calls, self.steps, self.max_repeat, self.max_steps = Counter(), 0, max_repeat, max_steps
    def check(self, name, args):
        self.steps += 1
        key = (name, json.dumps(args, sort_keys=True))
        self.calls[key] += 1
        if self.calls[key] > self.max_repeat:
            return "repeat"
        if self.steps > self.max_steps:
            return "max_steps"
        return None
```

**Break and recover**

1. On detection, **inject feedback**: "You already tried this three times with the same result. Try a different approach or ask the user."
2. Force a different action: disallow the repeated call, change strategy, or **replan**.
3. **Escalate:** ask the user for missing information or hand off to a human.
4. Stop with a **useful partial result** and explain what was tried.

**Prevent**

- Tool results that are informative: `{"found": false, "tried": "query=8841", "hint": "ask the customer for the email used"}`.
- Explicit instructions: "If a lookup returns nothing, ask the user instead of repeating it."
- Hard limits (steps, tokens, time), checkpoints, and tests that replay known looping scenarios.
