**Use cases:** contract review (clause extraction, deviation from playbook, redlines), due diligence over thousands of documents, e-discovery (relevance/privilege classification).

**Architecture**

```text
Document intake (DOCX/PDF/scans) -> OCR/layout -> structure parsing (sections, clauses, defined terms, cross-references)
   -> Indexing: clause-level chunks (with hierarchy and definitions), embeddings + keyword + metadata
   -> Analysis workflows:
        clause extraction & classification (governing law, termination, liability caps, indemnity...)
        playbook comparison (standard vs fallback vs unacceptable positions)
        Q&A with citations over the matter's documents
        cross-document consistency / version comparison
   -> Findings with exact quotes, page/paragraph anchors, risk level, suggested redline
   -> Lawyer review UI (accept/reject/edit) -> report + audit log
```

**Design decisions**

- **Citations are mandatory:** every finding links to the exact source text; unverifiable statements are rejected. Verify quotes programmatically (string match against the source).
- **Respect document structure:** legal meaning depends on defined terms, cross-references ("subject to Section 12.3") and exhibits; chunk by clause, keep definitions available in context, resolve references.
- **Long-context handling:** hierarchical processing for 100+ page agreements; retrieval + targeted reading rather than one giant prompt.
- **Playbook-driven:** the firm's/company's rules are encoded as structured checks that the LLM applies, producing consistent, explainable results.
- **High recall for risk flags** (missing a clause is costly) with ranking so reviewers see the important ones first; measure precision to avoid alert fatigue.
- **Confidentiality and privilege:** tenant isolation, encryption, no training on client data, access controls per matter, ethical walls, data residency, audit logs, retention/deletion.
- **Human accountability:** lawyers remain responsible; system is "assistive", with confidence indications and sampling-based QA (e.g. validate against attorney-coded sets, as in technology-assisted review).

**Evaluation:** clause-level precision/recall against lawyer-labelled data, citation accuracy, time saved per contract, inter-reviewer agreement vs AI, hallucination rate.

**Risks:** hallucinated clauses or case law (never cite law without retrieval from a verified source), jurisdiction differences, prompt injection inside documents, over-reliance by reviewers.
