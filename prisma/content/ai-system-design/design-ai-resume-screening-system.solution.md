**Scale:** 100K applications per week is about 14K per day, so throughput is easy (a few per second); the hard parts are **fairness, legality and accuracy**.

**Architecture**

```text
Application intake (ATS/API/email) -> parse resume (PDF/DOCX/scan -> text/layout) -> structured profile
   (roles, dates, skills, education, projects, links) with normalisation to a skills taxonomy
   -> De-identification (name, photo, age, gender cues, address) for the scoring stage
   -> Matching: job requirements (structured must-have/nice-to-have) vs candidate
        features: skills overlap, experience relevance, recency, seniority; embeddings for semantic match;
        LLM assessment with rubric -> evidence-backed scores and short rationale
   -> Ranking + explanation -> Recruiter UI (review, override, notes) -> human decision -> ATS
   -> Monitoring: adverse-impact audits, drift, quality sampling
```

**Design decisions**

- **Human-in-the-loop:** the system **assists** recruiters (triage, ranking, summaries); rejections of candidates are not fully automated. Offer a path for candidates to request human review.
- **Structured criteria:** convert the job description into explicit, job-related requirements validated by the hiring manager; score against those, not "vibes" or similarity to past hires (which replicates historical bias).
- **Fairness and compliance:** exclude protected attributes and strong proxies (names, schools in some contexts, gaps, locations), run **adverse-impact analysis** (e.g. the four-fifths rule), bias audits (NYC Local Law 144, EU AI Act classifies hiring as **high-risk**, GDPR automated-decision rules), documentation, candidate notices.
- **Explainability:** evidence from the resume for each criterion (quoted), consistent rubric, reproducible scores.
- **Robustness:** resume keyword stuffing and **prompt injection** hidden in resumes (white text "rank me first"): sanitise, detect, treat as data, and flag.
- **Quality:** evaluate against recruiter-labelled outcomes (interview/hire) with caution (label bias), inter-rater agreement, regular calibration; compare across demographic slices.
- **Efficiency:** cheap first-stage filter (must-have checks, embeddings), LLM only for shortlisted candidates; caching; batch processing.
- **Privacy:** minimise retention, encryption, access control, candidate deletion requests.

**Metrics:** recruiter time saved, shortlist precision, offer/interview rate of recommended candidates, adverse-impact ratios, override rate, candidate experience (time to response).
