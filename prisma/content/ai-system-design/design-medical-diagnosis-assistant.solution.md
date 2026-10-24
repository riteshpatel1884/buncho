**Positioning (critical):** **decision support for clinicians**, not an autonomous diagnostician. A clinician reviews every suggestion and remains responsible. This framing drives the safety, regulatory and UX design.

**Architecture**

```text
EHR (FHIR/HL7) + patient inputs -> De-identification/consent layer
   -> Context builder: demographics, history, meds, labs, imaging reports, notes (structured via NER/FHIR)
   -> Retrieval over vetted knowledge: guidelines, drug databases, literature (versioned, dated)
   -> Reasoning LLM + specialised models (imaging, risk scores, lab interpretation as tools)
   -> Output: ranked differential with evidence, uncertainty, red-flag alerts, recommended tests, citations
   -> Safety checks (drug interactions, contraindications, allergies) -> clinician UI -> feedback/audit log
```

**Design decisions**

- **Grounding and citations:** every claim traced to patient data or a cited guideline; refuse or flag when evidence is insufficient; show **uncertainty** and alternatives.
- **Deterministic safety layer:** rule-based interaction/dose checks and emergency "red flag" detectors (chest pain, stroke signs) independent of the LLM.
- **Tools over free generation** for calculations (risk scores, dosing).
- **Human oversight:** clinician accepts/edits/rejects; capture overrides as feedback; no automatic orders without approval.
- **Data governance:** HIPAA/GDPR, access control, audit trails, PHI encryption, data minimisation, on-prem/VPC deployment.
- **Bias and fairness:** evaluate performance across age, sex, ethnicity and care settings; monitor drift.
- **Regulation:** may qualify as **Software as a Medical Device** (FDA/CE/other); needs validation studies, change control for model updates, post-market monitoring.

**Evaluation:** retrospective case studies with specialist-labelled ground truth, top-k diagnostic accuracy, sensitivity for critical conditions (prioritise recall for dangerous diagnoses), hallucination/citation accuracy, prospective pilots, clinician usability and time impact.

**Failure modes:** anchoring/automation bias (clinicians over-trusting), outdated guidelines, incomplete records, and adversarial or erroneous inputs; mitigate with transparency, versioned knowledge and human review.
