**Don't decide from the headline number. Test it against your own situation.**

**1. Interrogate the 15%**

- Relative or absolute? On **your** task distribution or a public benchmark? Sample size and confidence interval? Contamination, prompt tuning effort given to each system (agent tuned heavily, RAG baseline not)?
- Re-run both on a **representative eval set from your real traffic** (with slices: easy vs hard queries) and measure variance across repeated runs.

**2. Compare on all dimensions, not only quality**

| Dimension | Simple RAG | Agentic system |
|---|---|---|
| Quality on hard/multi-step queries | Weaker | Better (this is where the 15% likely comes from) |
| Latency | 1 to 3 s | Often 5 to 30+ s (multiple LLM and tool calls) |
| Cost per query | Low, predictable | 3 to 20x, variable (loops) |
| **Reliability** | Fewer moving parts | Errors compound: ten steps each 95% reliable is only about 60% end-to-end (0.95^10 ≈ 0.60) |
| Debuggability | Inspect retrieval + prompt | Long traces, non-deterministic paths, harder to reproduce |
| Security surface | Prompt injection via documents | Tools, permissions, actions, larger blast radius |
| Maintenance | Easier; fewer prompts/tools to keep aligned | More components, versioning, evaluation overhead |
| Variance/consistency | More consistent | More run-to-run variation |

**3. Decide with product context:** what quality gap matters to users? If the 15% concerns rare hard queries and most traffic is simple, the agent's cost and latency are paid by everyone for a small gain. If hard queries drive value (research, multi-step workflows), the agent may justify it. Include risk: can the agent take actions with side effects?

**4. Prefer a staged/hybrid design**

- Start with **RAG as the baseline** and ship it; measure real failure categories.
- Add **routing:** simple queries to RAG; complex/low-confidence ones escalate to an agentic path with step and cost budgets (agentic RAG, bounded loops).
- Improve RAG first (better retrieval, reranking, query rewriting, a single retry step), as that often recovers much of the gap cheaply.
- Introduce agent capabilities incrementally where evals show clear wins.

**5. Run an A/B or shadow test** with guardrail metrics (latency, cost, error rate, user satisfaction), and set explicit thresholds: adopt the agent only if the gain on weighted real tasks exceeds the added cost/latency/maintenance by an agreed margin.

**Answer in one line:** "I'd verify the gain on our own data, weigh it against cost, latency, reliability and maintainability, ship the simpler system first, and escalate to agentic behaviour only for the queries where the measured benefit justifies it."
