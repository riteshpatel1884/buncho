**VQA:** given an **image (or video/document) and a natural-language question**, produce an answer ("How many people are wearing hats?" → "3"). It requires perception, language understanding, and often reasoning, counting, OCR or world knowledge.

**Variants**

- Open-ended vs multiple-choice VQA; yes/no; counting.
- **Knowledge-based VQA** (OK-VQA, A-OKVQA), **text-in-image** (TextVQA), **documents** (DocVQA), **charts** (ChartQA), **diagrams/science** (ScienceQA), **medical** VQA, **video QA**, **visual reasoning** (GQA, NLVR2), expert-level (MMMU).

**Methods**

- **Early:** CNN image features + LSTM question embedding, fused with attention (bottom-up top-down attention with region features).
- **Pretrained VL transformers:** ViLBERT, LXMERT, ViLT, BLIP/BLIP-2, Flamingo.
- **Modern:** instruction-tuned VLMs (LLaVA, Qwen-VL, GPT-4o/Gemini/Claude vision) generate free-text answers by encoding the image into tokens and reasoning with an LLM; chain-of-thought and tool use (OCR, detectors, code) for harder problems.

```python
answer = vlm(image=img, prompt="Question: How many chairs are visible? Answer with a number.")
```

**Evaluation pitfalls**

- **Language priors:** models answer from text statistics ("What colour is the banana?" → yellow) without looking; VQAv2 was balanced with complementary images, and tests should include counterfactual images.
- Answer-format mismatch (exact match vs semantic equivalence), so normalise or use judges.
- Hallucinated objects, weak counting and spatial reasoning; resolution limits for small text.

**Applications:** accessibility (describing scenes to blind users), customer support with screenshots, document/chart analysis, medical imaging aid, e-commerce and robotics.
