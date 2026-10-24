**1. Clarify what you need to adapt:** vocabulary and style, task formats (contract clause extraction, ICD coding, financial report summaries), reasoning patterns, or fresh knowledge. Use **RAG for up-to-date facts and citations**, fine-tuning for **behaviour, terminology and format**.

**2. Data**

- Domain corpora (filings, case law, guidelines, papers) for optional **continued pre-training**.
- **Expert-written or expert-reviewed** instruction data: real tasks, correct answers, appropriate caveats and refusals.
- Synthetic data from documents, but validated by experts.
- De-identify PII/PHI; confirm licences and consent (HIPAA, GDPR, client confidentiality).

**3. Training stages**

1. Pick a strong base (general or an existing domain model such as a medical or finance LLM).
2. (Optional) continued pre-training on domain text with a low LR and general-data replay.
3. **SFT with LoRA/QLoRA** on expert examples.
4. (Optional) preference tuning (DPO) with expert rankings to reward cautious, accurate, well-cited answers.

**4. Combine with retrieval and tools:** retrieve authoritative sources, require citations, call calculators or code for numbers (finance), and decline when the sources do not support an answer.

**5. Evaluation**

- Domain benchmarks (MedQA, LegalBench, FinQA) **plus your own expert-labelled test set**.
- **Hallucination and citation accuracy**, numerical correctness, refusal behaviour.
- General-capability regression and **safety** tests.
- Expert review (clinicians, lawyers, analysts) in the loop; track disagreement.

**6. Governance:** human sign-off for high-stakes outputs, disclaimers, audit logs, monitoring of drift, versioned models and data, and a documented limitation statement.

**Pitfall:** a fine-tuned model sounds more authoritative, so unsupported claims become more dangerous; build verification into the system, not only the model.
