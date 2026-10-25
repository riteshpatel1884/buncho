**1. Diagnose and categorise errors** (sample 200 failures): hallucinated objects, wrong attributes (colour, text), counts, spatial relations, OCR errors, over-confident details, ignoring small regions. Run **POPE/CHAIR/AMBER** style probes and a golden set; check whether errors cluster by image type, resolution, or prompt.

**2. Find the cause**

- **Perception limits:** low resolution, downscaling, small text, weak vision encoder.
- **Language prior dominance:** the LLM completes plausible descriptions ("a kitchen has a fridge") regardless of the image.
- **Training data:** noisy/over-detailed captions that mention things not visible, synthetic captions with errors.
- **Long generations:** later sentences drift from the image; sycophancy to leading prompts.

**3. Fixes**

| Layer | Actions |
|---|---|
| **Input** | Higher resolution/tiling, crops of regions of interest, better preprocessing |
| **Prompting** | "Describe only what is visible; say 'unclear' if uncertain"; ask for structured, grounded output (objects with boxes), shorter descriptions |
| **Decoding** | Contrastive/visual-contrastive decoding (VCD, OPERA) that penalises tokens not supported by the image, lower temperature |
| **Tools** | Detector/OCR/segmentation outputs fed as evidence; **verify-then-answer** loop: generate claims, check each with targeted VQA questions, drop unsupported ones (self-verification, "Woodpecker") |
| **Training** | Fine-tune on high-quality, human-verified, fine-grained captions; include **negative examples** ("Is there a dog?" → no); preference tuning with hallucinated vs correct pairs (RLHF-V, DPO), reduce language priors by training with perturbed or blank images |
| **Model** | Stronger/larger vision encoder, better connector, multi-resolution features |
| **Product** | Confidence/uncertainty, citations to regions, human review in critical cases |

**4. Validate:** hallucination rate (CHAIR/POPE), recall of correct details, human faithfulness rating, regression on general benchmarks, and image-ablation test (answers must change when the image changes).
