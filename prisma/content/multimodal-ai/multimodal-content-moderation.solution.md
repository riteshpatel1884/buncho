**Why multimodal is harder:** harm can be in any channel or only in their **combination** (a benign image with a hateful caption, memes, coded symbols, speech in video, text rendered in images, deepfakes).

**Architecture**

1. **Ingest and extract:** decode media; OCR image text, ASR audio, sample video frames/keyframes, read metadata; keep time/box references.
2. **Per-modality classifiers (fast, cheap):** image/video classifiers (nudity, violence, weapons, self-harm), text toxicity, audio classifiers, **hash matching** (PhotoDNA/PDQ/CSAI-Match for known CSAM/terror content; legal reporting duties), face/age signals where lawful, spam/duplicate detection, deepfake/provenance (C2PA).
3. **Cross-modal reasoning:** a **VLM/LLM judge** with the policy prompt receives image + caption + transcript + comments and returns category, severity, rationale, and confidence; used for ambiguous or high-reach content.
4. **Decision engine:** combine scores with policy rules and context (audience, age, region, account history); actions: allow, label/age-gate, reduce distribution, remove, escalate.
5. **Human review:** queues by severity/language/market, wellbeing protections (blur, grayscale, limits), second review for appeals, QA sampling.
6. **Feedback:** appeals and reviewer labels retrain models; red-team and adversarial sets (typographic attacks, adversarial perturbations, memes).

**Scaling:** tiered cascade (cheap filters first; VLM on a small percentage), frame sampling plus audio-first checks for video, near-real-time path for live streams, pre-publication vs post-publication trade-offs.

**Metrics:** precision/recall per policy per modality, prevalence, time-to-action, reviewer agreement, appeal overturn rate, harms per 10k views, cost per item; audit for demographic/cultural bias.

**Risks:** over-removal of news/art/education, adversarial evasion, regional norms, privacy of reviewers/users, and legal compliance (DSA, Online Safety Act). Document policies and publish transparency reports.
