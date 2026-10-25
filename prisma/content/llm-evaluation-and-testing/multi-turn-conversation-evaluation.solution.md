**Why it is harder than single-turn:** quality depends on **context accumulation**, consistency, memory, goal progress and recovery from user corrections. Errors compound, and the best next turn depends on earlier turns.

**What to measure**

| Level | Aspects |
|---|---|
| **Turn-level** | Relevance, correctness, helpfulness, tone, safety, coherence with the immediate question |
| **Conversation-level** | **Task completion / goal success**, number of turns to resolve, user effort, final satisfaction |
| **Memory and context** | Remembers facts from earlier turns, resolves references ("that one"), no contradictions, consistent persona, instruction retention over time |
| **Dialogue management** | Asks clarifying questions when needed, handles topic switches, interruptions and corrections, knows when to escalate |
| **Robustness** | Behaviour after many turns, long contexts, adversarial multi-turn jailbreaks (gradual escalation) |

**Test construction**

- **Logged real conversations** (anonymised) replayed up to turn N; judge the next response given the true history (static, cheap, but diverges from what the new model would have said).
- **Scripted scenarios** with checkpoints (e.g. "by turn 6 the assistant must use the delivery address given on turn 2").
- **User simulators:** an LLM plays a persona with a goal and hidden constraints, interacting with the system for a full conversation; evaluate the outcome (tau-bench-style tasks, MT-Bench-101, MultiChallenge). Run multiple seeds and personas; validate the simulator against real users.

**Judging methods**

- **Programmatic checks:** goal state reached (database state, API calls made), constraints respected.
- **LLM-as-judge** over the **whole transcript** with rubrics (goal success, consistency, helpfulness) plus turn-level scoring; use pairwise comparisons for versions; calibrate with human labels.
- **Human evaluation** on sampled conversations, annotating failure points.
- **Online signals:** abandonment, rephrasing/repetition, escalation to humans, thumbs, conversation length vs success.

**Pitfalls:** judging single turns in isolation, ignoring long-context degradation, simulators that are too cooperative, optimising length of conversation as engagement when shorter resolution is better, and not testing history truncation/summarisation logic.

**Practice:** report both turn-level and conversation-level metrics, slice by conversation length, and add failed conversations to the regression suite.
