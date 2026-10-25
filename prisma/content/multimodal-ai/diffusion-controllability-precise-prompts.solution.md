**Why prompts fail:** text encoders (CLIP/T5) compress language into limited embeddings; models struggle with **counting, spatial relations, attribute binding** ("red cube on blue sphere"), negation, long prompts and exact text rendering. Training captions rarely contain precise layout information.

**Improvements**

| Approach | How it helps |
|---|---|
| **Better text conditioning** | Models with stronger encoders and joint attention (SD3/Flux MMDiT with T5/LLM encoders); LLM-rewritten, detailed prompts; train on dense recaptions |
| **Classifier-free guidance** tuning | Raise guidance scale (about 5 to 9) for more adherence (too high saturates and reduces diversity) |
| **Structural conditions: ControlNet, T2I-Adapter, IP-Adapter** | Add edges, depth, pose, segmentation, scribbles, or reference image/style/face to fix composition exactly |
| **Layout/region control** | GLIGEN, bounding-box/regional prompting, attention masking (per-region prompts), layout-to-image via LLM planner |
| **Attention-based guidance** | Attend-and-Excite, prompt-to-prompt, attention reweighting to make sure every object token is realised |
| **Personalisation** | LoRA/DreamBooth/textual inversion for specific subjects/styles; reference adapters |
| **Inpainting/editing pipeline** | Generate base then fix regions (inpaint), InstructPix2Pix, image-to-image with partial denoising strength |
| **Iterative refinement with verification** | Generate N candidates, score with a VLM/detector/CLIP/**reward model** (ImageReward, PickScore), reject or regenerate; best-of-N or RL fine-tuning (DDPO, DPO for diffusion) on alignment rewards |
| **Text rendering** | Models trained for typography (Flux, Ideogram, SD3), or composite text afterwards |
| **Seeds and prompts discipline** | Fixed seeds, negative prompts, prompt weighting syntax |

**Process:** define the failing requirement, choose the matching control (spatial → ControlNet/layout; identity → IP-Adapter/LoRA; counting/binding → attention guidance or verifier loop), measure with prompt-alignment benchmarks (GenEval, T2I-CompBench, DSG), and combine controls while checking each does not degrade quality.
