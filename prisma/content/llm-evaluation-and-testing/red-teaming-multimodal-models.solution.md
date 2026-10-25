**Why text-only testing is insufficient:** safety training, filters and benchmarks are strongest on text. Adding images, audio, video or documents creates **new channels** and **interactions between modalities** where harmful intent can be hidden or where models behave differently.

**Attack classes**

| Attack | Example |
|---|---|
| **Cross-modal composition** | Benign text ("How do I make this?") + image of a harmful object/diagram; neither alone is unsafe, the combination is |
| **Typographic / OCR injection** | Instructions rendered as text inside an image ("ignore previous rules...") or tiny/low-contrast hidden text, QR codes |
| **Indirect injection through files** | Malicious instructions in PDFs, slides, screenshots, web pages, image metadata (EXIF), subtitles, audio transcripts |
| **Adversarial perturbations** | Imperceptible pixel or audio noise that triggers unsafe output or hides content from classifiers; adversarial patches |
| **Modality switching/jailbreaks** | Refused in text but accepted when the request is spoken, pictured, translated, or split across modalities and turns |
| **Privacy attacks** | Identifying people from faces, geolocating photos, extracting private information from screenshots |
| **Harmful generation** | Image/audio generation of deepfakes, non-consensual content, voice cloning, copyrighted likeness |
| **Content-moderation evasion** | Memes, coded imagery, visual puns, stylised text, steganography |
| **Hallucination and misreading** | Misread charts, medical images, documents with safety consequences |

**Red team structure**

1. **Threat model** per product feature (image upload, camera/live video, voice mode, document analysis, agents acting on screenshots) and policy taxonomy mapped to each modality.
2. **Build a multimodal test set:** paired and unpaired inputs (text-only, image-only, combined), languages/scripts, cultural contexts, real-world photos, synthetic images, screenshots, audio with accents/noise; include **benign look-alikes** to measure over-refusal.
3. **Mix manual and automated attacks:** human red teamers with domain expertise; automated generation of typographic images, adversarial examples (white-box where you control the model, transfer attacks otherwise), LLM-generated scenarios, fuzzing of file formats.
4. **Test the whole pipeline:** upload handling, OCR/ASR, classifiers per modality, system prompts, tools triggered by multimodal input, rendering and output filters.
5. **Metrics:** attack success rate per modality and per **modality combination**, refusal accuracy, over-refusal on benign inputs, severity-weighted findings; compare text-only vs multimodal versions of the same request to quantify the **safety gap**.
6. **Mitigations:** multimodal safety training data and classifiers, extract-and-scan (OCR/ASR text goes through the text safety stack), treat in-image text as **untrusted data**, image/audio perturbation defences, input sanitisation (strip metadata, re-encode), least-privilege tools, human approval for actions, output filters for generated media, watermarking.
7. **Regression and cadence:** add successful attacks to automated suites, rerun for each model/prompt/tool update, publish findings and fixes, and monitor production for novel patterns.
