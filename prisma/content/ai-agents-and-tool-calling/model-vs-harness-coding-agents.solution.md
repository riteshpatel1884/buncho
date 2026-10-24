**Short answer:** both are necessary, and they are multiplicative. The **model sets the ceiling** (reasoning, code quality, instruction following); the **harness determines how much of that ceiling you reach** on real, multi-step work.

**What the model provides**

- Code understanding and generation, planning, debugging, long-horizon coherence.
- Reliable tool use and following instructions across many steps.

**What the harness provides**

- **Context gathering:** search, grep, file reading, code indexing; it decides what the model sees.
- **Editing tools:** precise patch/edit operations that rarely corrupt files.
- **Feedback loops:** run tests, compilers, linters; show failures so the model can fix them.
- **Context management:** compaction, subagents, memory files, so long sessions do not degrade.
- **Safety and trust:** permission prompts, sandboxes, checkpoints and undo.
- **UX and workflow:** plan mode, hooks, project instructions (for example a CLAUDE.md-style file), integration with Git and CI.

**Evidence and examples**

- On coding benchmarks, the **same model scores very differently under different scaffolds**, and scaffold changes can move scores by many points.
- A strong model with a poor harness reads the wrong files, cannot test its change, and loses track in long sessions. A weaker model with a strong harness can outperform expectations on well-scoped tasks.
- Model upgrades help most when the harness already supplies good context and verification.

**How I would decide where to invest:** run the eval tasks and read failure traces. If failures are "did not know the code" or "could not verify", fix the harness. If failures are "wrong reasoning despite good context", try a stronger model. Report that **the answer is the pair**, and that harness work is usually cheaper and more controllable than waiting for a model.
