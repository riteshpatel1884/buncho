```python
from dataclasses import dataclass, field

@dataclass
class Agent:
    name: str
    role_prompt: str
    llm: callable                                   # llm(messages) -> str

    def run(self, task: str, context: str = "") -> str:
        msgs = [{"role": "system", "content": self.role_prompt},
                {"role": "user", "content": f"Task:\n{task}\n\nContext:\n{context}"}]
        return self.llm(msgs)

@dataclass
class Board:                                         # shared state, append-only log
    task: str
    log: list = field(default_factory=list)
    def add(self, who, text): self.log.append((who, text))
    def context(self, last=6):
        return "\n\n".join(f"[{w}] {t}" for w, t in self.log[-last:])

def run_team(task, llm, max_rounds=3):
    planner = Agent("planner", "Break the task into 3 concrete research questions.", llm)
    researcher = Agent("researcher", "Answer the questions with facts. Say when unsure.", llm)
    writer = Agent("writer", "Write a clear answer using only the notes provided.", llm)
    critic = Agent("critic", "Review the draft. Reply 'APPROVED' or list specific fixes.", llm)

    board = Board(task)
    board.add("planner", planner.run(task))
    board.add("researcher", researcher.run(task, board.context()))
    draft = writer.run(task, board.context())
    for round_ in range(max_rounds):                 # bounded revision loop
        board.add("writer", draft)
        review = critic.run(task, f"DRAFT:\n{draft}")
        board.add("critic", review)
        if review.strip().upper().startswith("APPROVED"):
            return draft
        draft = writer.run(task, board.context() + f"\nFix these issues:\n{review}")
    return draft                                     # best effort after the budget
```

**Design points**

- **Roles = different instructions, tools and context windows**; this separation is the benefit (specialisation, parallel work, independent review).
- **Coordination patterns:** this is a *supervisor/pipeline* with a critic loop; alternatives are parallel fan-out and peer debate.
- **Shared state** (board) rather than every agent seeing everything keeps context small.
- **Termination:** explicit approval signal plus a max-rounds cap, and token/cost budgets.
- **Risks:** more calls (cost, latency), error propagation, agents agreeing with each other's mistakes. Use multi-agent only when one agent with tools is demonstrably not enough.
- Log every message for debugging and evaluation.
