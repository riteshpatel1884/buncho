**1. Policy first (with clinicians and legal/regulatory):** allowed = general health education, navigation, appointment help, summarising records with citations; disallowed = diagnosing, prescribing, dosing changes, interpreting individual results as conclusions, discouraging care. Check whether your use makes it **medical-device software** (FDA SaMD / EU MDR), which changes obligations.

**2. Layered guardrails**

| Layer | Controls |
|---|---|
| **Input** | Intent/topic classifier (diagnosis-seeking, medication, emergency, self-harm), PII handling, prompt-injection defence |
| **Emergency triage** | Rules + classifier for red-flag symptoms (chest pain, stroke signs, suicidal ideation): immediately show emergency guidance and local numbers, hand off to a human; do not continue casual chat |
| **System prompt/policy** | Scope, tone, "I can't diagnose; here is general information and when to seek care", always recommend a clinician for personal decisions |
| **Grounding** | RAG over vetted sources (guidelines, formulary), mandatory citations, "don't know" behaviour |
| **Output** | Classifier/LLM-judge for diagnostic language ("you have...", "it is definitely..."), dosage and drug-interaction checks against a medical knowledge base, block or rewrite, add disclaimers where useful |
| **Human oversight** | Clinician review for flagged or high-risk responses, escalation queue, nurse-line handoff |
| **Fine-tuning** | Preference-tune for safe completion and appropriate deferral; avoid over-refusal that blocks benign info |

**3. Evaluate:** build a test set of boundary cases (symptom-checker prompts, jailbreaks, ambiguous questions, multilingual), measure violation rate, over-refusal, emergency-recall (must be near 100%), clinician-graded safety; red team before and after releases.

**4. Operate:** log and review, user feedback, incident process for harmful outputs, compliance (HIPAA/GDPR), transparency labels that this is AI, and regular clinical governance review.
