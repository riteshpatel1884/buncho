**Evaluate by capability and by component**

| Task | Metrics / benchmarks |
|---|---|
| **VQA / reasoning** | Accuracy on VQAv2, GQA, MMMU, MathVista, MMBench, MMStar; exact match or judge for open answers |
| **Captioning** | CIDEr, SPICE, CLIPScore, human/LLM-judge for faithfulness; **CHAIR**/POPE for object hallucination |
| **OCR / documents** | CER/WER, field-level F1, DocVQA (ANLS), ChartQA, table structure (TEDS) |
| **Retrieval (image-text)** | Recall@k, MRR, nDCG |
| **Speech** | WER/CER (ASR), MOS/speaker similarity (TTS), voice-to-voice latency |
| **Image generation** | FID, CLIPScore, **prompt alignment** (T2I-CompBench, GenEval, DSG), human preference (ImageReward, Elo) |
| **Video** | Video-MME, MVBench, temporal reasoning; action/event accuracy |
| **Agents / GUI** | Task success on OSWorld, WebArena |

**Practical strategy**

1. **Build a domain golden set** of real images/audio/documents with questions and ground truth; slice by image quality, language, layout type, resolution, lighting, accents.
2. **Test grounding:** does the answer depend on the image? Ablations (blank/shuffled image) should fail; text-only baseline reveals language-prior shortcuts.
3. **Hallucination probes:** existence and counting questions (POPE), negative cases ("Is there a dog?" when none), attribute binding.
4. **Component evals:** OCR quality, retrieval recall, then end-to-end answer quality, to locate failures.
5. **LLM/VLM-as-judge** with rubrics for open-ended output, validated against human labels; pairwise preference with position randomisation.
6. **Robustness:** compression, rotation, blur, low light, crops, adversarial/typographic text, noisy audio, accents.
7. **Safety:** cross-modal red teaming, privacy (face/person identification), bias across demographics.
8. **Efficiency:** latency, tokens per image, cost, memory.
9. **Production:** sample traces with human review, user feedback, drift in input distribution (new camera types), regression suite on every model or prompt update.

Beware benchmark contamination and saturation; report confidence intervals and per-slice results.
