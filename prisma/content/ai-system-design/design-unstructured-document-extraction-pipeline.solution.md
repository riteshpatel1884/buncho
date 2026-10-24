**Requirements:** high volume (thousands to millions of pages/day), mixed formats (scanned PDFs, photos, Excel, email), field-level accuracy, auditability, PII/regulatory compliance (financial institutions), integration with downstream systems.

**Pipeline**

```text
Ingest (email, SFTP, API, scanners) -> Classification (document type, language)
   -> Pre-processing (de-skew, denoise, page split) -> OCR / layout analysis (text, tables, key-value, reading order)
   -> Extraction: schema per document type
        LLM/VLM structured extraction (JSON schema, constrained decoding) + rules/regex for IDs, dates, amounts
   -> Validation: schema, business rules (totals add up, dates valid, checksum/IBAN), cross-field and database checks
   -> Confidence scoring (model signals + validation + agreement of multiple extractors)
   -> Auto-approve high confidence | Human review UI for low confidence (field-level, source highlighted)
   -> Export (ERP/core banking/API) + audit store -> Feedback to improve prompts/models
```

**Design decisions**

- **Hybrid OCR + vision-language model:** OCR provides precise text and boxes; VLM handles layout understanding and messy documents; keep **bounding boxes** so every value links back to the page region (traceability).
- **Schema-first:** a versioned schema per document type; structured output validated with Pydantic/JSON Schema; **repair loop** on invalid output.
- **Long documents:** chunk by page/section, extract per chunk, then reconcile; tables handled by table-structure models.
- **Accuracy engineering:** few-shot examples per customer/layout, self-consistency (extract twice and compare), arithmetic validations, golden datasets with field-level precision/recall.
- **Human-in-the-loop:** reviewers correct fields; corrections become labelled data; track straight-through-processing (STP) rate.
- **Cost/scale:** route simple templates to cheap deterministic extractors, send hard ones to large models; batch and queue; cache by document hash.
- **Compliance and security:** encryption, access control, PII redaction, data residency, retention, full audit trail; no training on customer data without consent; defend against prompt injection embedded in documents.

**Metrics:** field-level F1, STP rate, human-review rate, extraction latency, cost per page, error cost (critical fields such as amounts weighted higher).
