**Measure first:** compute **inter-annotator agreement** (percent agreement, **Cohen's/Fleiss' kappa** or Krippendorff's alpha) overall and **per category, prompt type and annotator**. Pairwise preference agreement of 60 to 75% is common for open-ended tasks, so judge relative to the task difficulty.

**Find the cause**

- **Ambiguous guidelines:** "better" is undefined (helpful vs concise vs safe).
- **Genuinely close pairs** (both answers similar): disagreement is expected; low information.
- **Subjective topics** (humour, politics, culture): real differences in values.
- **Annotator problems:** insufficient training, fatigue, spam/low effort, position or length bias, lack of domain expertise.
- **Task design:** pairs too long, no time, missing context or reference.

**Improve quality**

1. **Clear rubric** with ranked criteria (e.g. safety, then correctness, then helpfulness, then style) and **worked examples**, including edge cases; revise it from disagreement analysis.
2. **Calibrate and train annotators**, run pilot rounds, give feedback, remove consistently outlying or low-quality annotators; use domain experts for specialised content.
3. **Gold questions** with known answers to monitor ongoing quality.
4. **Redundancy:** 3 or more labels per item; aggregate by majority or a model (Dawid-Skene); send disagreements to **adjudication** by a senior reviewer.
5. **Richer signals:** ask for ratings on dimensions, tie options ("equal"), confidence and short justifications instead of a forced binary choice.
6. **Reduce bias:** randomise order, control length bias, check for sycophancy preferences.

**Use noisy labels sensibly**

- **Filter** to high-agreement pairs (or weight by confidence/margin); keep ambiguous pairs out of training or give them low weight.
- Use **label smoothing / noise-robust reward-model training**, and train on the soft distribution of votes.
- Keep a **separate, clean validation set** for reward-model accuracy.
- Supplement with **AI feedback** (RLAIF) and compare it with human agreement.

**Check outcome:** reward-model accuracy on held-out gold pairs, and downstream win rate; low agreement caps how accurate any reward model can be.
