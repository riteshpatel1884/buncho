**Definition:** LLMs trained to produce a long internal **chain of thought** (planning, checking, backtracking) before the final answer, so extra inference compute buys better accuracy on hard problems. This is **test-time compute scaling**.

**How they are built**

1. Start from a strong base model; optionally SFT on reasoning traces.
2. **Reinforcement learning with verifiable rewards** (maths answers, unit tests, logic puzzles) using PPO/GRPO-style algorithms. The model discovers behaviours such as self-verification and retrying.
3. Optionally distil the reasoning into smaller models.

**Behaviour vs a standard LLM**

| | Standard LLM | LRM |
|---|---|---|
| Output | Answer directly (or short CoT if prompted) | Long hidden/visible reasoning, then answer |
| Latency / cost | Low | High (many thinking tokens) |
| Maths, code, planning | Good | Much better |
| Simple chat, rewriting | Great | Overkill |

**Use LRMs for:** multi-step maths, complex coding and debugging, planning, scientific problems, agentic tasks where correctness matters.

**Avoid for:** latency-sensitive or simple tasks, high-volume cheap requests.

**Practical notes**

- Control cost with a thinking budget / effort setting and max tokens.
- Do not add "think step by step" prompts needlessly; they already do.
- Weaknesses: over-thinking easy questions, reasoning text that does not always reflect what drove the answer, reward hacking on verifiers, and quality drops on tasks without verifiable feedback.
