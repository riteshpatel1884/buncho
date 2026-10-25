**1. Confirm with ablations**

- Replace the image with **blank/noise/another image**: if output barely changes, the image is ignored.
- Compare text-only vs image+text accuracy on questions that *require* the image.
- Inspect **attention/gradient attribution** over visual tokens; check the number of image tokens actually in the prompt.

**2. Common causes and fixes**

| Cause | Fix |
|---|---|
| **Pipeline bug:** image not passed, wrong placeholder token, missing `<image>` in template, image processor mismatch, truncated sequence cutting off visual tokens, wrong dtype/normalisation | Print the final input tokens and visual feature statistics; use the exact chat template and processor; unit-test with known-answer images |
| **Weak alignment:** projector undertrained or encoder frozen with poor features | Redo/extend stage-1 alignment, unfreeze projector (and LoRA the encoder), higher-res features |
| **Language-prior dominance:** training questions answerable without the image | Curate data requiring visual grounding; add **counterfactual pairs** (same question, different images/answers), negative and "not visible" questions; **blank-image augmentation** with target "cannot determine" |
| **Prompt too strong/long text context** drowning the image | Put the image early, shorten system prompts, instruct "base your answer only on the image" |
| **Visual tokens down-weighted** | Increase visual token count/resolution, scale visual embeddings, **visual contrastive decoding** at inference, attention-sharpening techniques |
| **Over-trained LLM (full fine-tune on text)** | Mix multimodal data, use LoRA, lower LR to avoid catastrophic forgetting of visual skills |
| **Sycophancy to leading text** | Preference-tune on image-grounded answers vs text-prior answers |

**3. Verify:** blank-image ablation accuracy should drop to chance, image-swap sensitivity test, POPE/MMBench/MMStar (designed to need vision), and user-facing evals on real images.
