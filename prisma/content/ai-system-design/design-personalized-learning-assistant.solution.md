**Requirements:** adaptive difficulty, explanations in the learner's style, practice and feedback, long-term progress tracking, curriculum alignment, safety for minors, accuracy.

**Architecture**

```text
Learner profile + knowledge state (skills graph, mastery estimates, goals, preferences, history)
   -> Tutor orchestrator: decide next step (explain, hint, quiz, review, break)
        Tools: curriculum/RAG (vetted content), problem bank + generator, code/math checker, calculator
   -> LLM tutor (Socratic prompting, scaffolded hints) -> Guardrails -> Learner
   -> Evidence from answers -> Knowledge-tracing model updates mastery -> Spaced-repetition scheduler
```

**Design decisions**

- **Knowledge model:** map content to a **skill graph** (prerequisites); estimate mastery with knowledge tracing (Bayesian/IRT/deep KT), and pick the next item at the learner's "zone of proximal development".
- **Pedagogy over answers:** the tutor gives **hints and guiding questions** first, not the final answer (configurable), checks understanding, and adapts explanations (analogies, level, language).
- **Grounding:** use curriculum content and verified solutions; verify maths/code with tools rather than trusting the LLM; flag uncertainty.
- **Assessment:** auto-generated questions reviewed or validated (answer checking, difficulty calibration), rubric-based grading of free text with LLM judges and spot human checks.
- **Retention:** spaced repetition (review scheduling), progress dashboards, goal tracking, parent/teacher views.
- **Memory and personalisation:** durable profile (strengths, misconceptions, interests) with privacy controls.
- **Safety and compliance:** age-appropriate content, moderation, privacy law for minors (COPPA/FERPA/GDPR-K), no manipulative engagement tactics, transparency.

**Evaluation:** learning gains (pre/post tests, randomised trials), mastery prediction accuracy, answer correctness, hint quality (human review), engagement and retention, equity across learner groups.
