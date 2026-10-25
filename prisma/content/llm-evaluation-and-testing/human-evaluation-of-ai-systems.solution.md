**1. Define the question:** what decision will the result drive (ship model B? tune tone? audit safety?). Choose dimensions: correctness, helpfulness, faithfulness, harmlessness, tone, formatting.

**2. Design the task**

- **Pairwise preference** ("A vs B", with tie option, randomised order): more reliable and sensitive than absolute scores; used for model comparison.
- **Rubric rating** (e.g. 1 to 5 per criterion with written anchors and examples) for diagnostics.
- **Error annotation** (label each hallucination, unsafe statement, missing step) for fine-grained analysis.
- **Ranking** of several outputs; **task-based** evaluation (can the user complete the task?).

**3. Prepare**

- Write **clear guidelines** with examples and edge cases; pilot with a few annotators and revise.
- **Sample prompts** representative of production (stratified by topic, difficulty, language), plus adversarial cases.
- Blind the system identities; randomise order and position.
- Choose annotators: **domain experts** for medical/legal/code, trained crowd workers for general quality; ensure diversity where subjectivity matters.

**4. Quality control**

- **2 to 3 independent labels per item**; compute **inter-annotator agreement** (Cohen's/Fleiss' kappa, Krippendorff's alpha); investigate disagreements and adjudicate.
- **Gold items with known answers** and attention checks to catch low-effort work; track per-annotator drift.
- Limit session length to reduce fatigue; fair pay and clear instructions.

**5. Analyse**

- Win rates with **confidence intervals** (bootstrap or binomial), significance tests, per-slice breakdowns; examine qualitative comments.
- Sample size from the expected effect size (hundreds of pairs detect moderate differences; small differences need thousands).

**6. Use and iterate:** calibrate LLM judges against these labels, add disagreements to the golden set, and repeat before major launches.

**Pitfalls:** vague criteria, leading wording, annotators favouring longer/formatted answers, unrepresentative prompts, tiny samples, treating agreement as truth when the guidelines themselves are ambiguous.
