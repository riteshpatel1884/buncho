**Idea:** make the model write **intermediate reasoning steps** before the final answer. Each generated token becomes extra computation, so multi-step problems become easier.

**Variants**

- **Zero-shot CoT:** append "Let's think step by step."
- **Few-shot CoT:** examples that include worked reasoning.
- **Structured CoT:** "First list facts, then compute, then answer in `<answer>` tags."
- With **reasoning models**, thinking happens internally; you usually should not add manual CoT.

```text
Q: A shop sells pens at 3 for $4. How much do 12 pens cost?
Let's think step by step.
12 pens = 4 groups of 3. Each group costs $4. 4 x $4 = $16.
Answer: $16
```

**Use it for:** arithmetic, logic, multi-hop questions, planning, code reasoning, tasks with several constraints.

**Avoid or limit it for:** simple lookups or classification (no gain, more tokens and latency), tasks where the reasoning text must not be shown to users, and very small models (can produce plausible but wrong steps).

**Caveats**

- Reasoning text can look convincing yet be wrong or unfaithful to what actually drove the answer; verify the final answer.
- It increases output tokens, cost and latency.
- Separate reasoning from the final answer (`<reasoning>` and `<answer>` tags) so downstream code parses only the answer.

**Combine with:** self-consistency (vote over several chains), verification steps, or tools for exact calculation.
