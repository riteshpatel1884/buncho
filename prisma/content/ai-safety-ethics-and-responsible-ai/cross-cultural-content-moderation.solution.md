**Why it happens**

- Models trained mostly on English/Western data; **dialect bias** (e.g. African-American English flagged as toxic more often), reclaimed slurs and in-group slang, code-switching/transliteration (Hinglish, Arabizi), religious or political terms, humour and sarcasm, names and places containing "bad" substrings.
- Policies written from one cultural lens; lexicon-based filters with no context; annotators without local knowledge.

**Diagnose**

- **Disaggregate metrics** by language, region, dialect: false-positive and false-negative rates, appeal overturn rates per market, and human audit samples from local reviewers. Build **counterfactual tests** (same sentence in different dialects).

**Fix**

1. **Locale-aware policy:** global baseline (illegal/universally harmful content) plus **market-specific guidelines** with local legal requirements and community input; context rules (who is speaking to whom, quoted or reclaimed usage).
2. **Data:** collect and label in-language, in-context data with **native annotators** and diverse pools; document disagreements instead of forcing one label; multilingual and dialect-balanced training; fine-tune or add locale-specific adapters/classifiers.
3. **Model and thresholds:** per-locale threshold calibration, context features (thread, community, speaker), use multilingual LLMs with policy prompts and explanations, route low-confidence or culturally sensitive cases to **human reviewers from that region**.
4. **Appeals and feedback:** easy appeals, fast fixes, and learning from overturned decisions; trusted-partner and civil-society advisory groups.
5. **Evaluation and governance:** locale-specific benchmarks and red teams, transparency reports by region, regular audits, clear escalation, and review of rule changes for disparate impact (DSA compliance in the EU).

**Principle:** moderation is context-dependent; combine universal safety floors with local calibration and human judgement.
