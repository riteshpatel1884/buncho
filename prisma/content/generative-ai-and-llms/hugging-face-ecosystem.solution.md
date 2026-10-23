**Hugging Face** is a platform and open-source ecosystem for sharing and using machine-learning models and datasets.

**Components**

- **Hub:** hosts hundreds of thousands of models, datasets and demo Spaces, with model cards and versioning.
- **`transformers`:** load and run pre-trained models (text, vision, audio, multimodal) with a unified API.
- **`datasets`:** efficient loading, streaming and processing of datasets.
- **`tokenizers`:** fast tokenization.
- **`peft` / `trl`:** parameter-efficient fine-tuning (LoRA) and RLHF/DPO-style training.
- **`accelerate`:** multi-GPU / mixed-precision training with little code change.
- **`evaluate`, `sentence-transformers`, `safetensors`**, and Inference Endpoints for hosting.

```python
from transformers import pipeline

qa = pipeline("question-answering")
qa(question="Who wrote it?", context="The report was written by Asha in 2024.")
```

```python
from datasets import load_dataset
ds = load_dataset("imdb", split="train[:1%]")
```

**Why it matters:** it turns weeks of model-building into minutes (download, run, fine-tune), standardises interfaces, and lets you swap models easily. **Caution:** check licence, model card and safety of each model; prefer `safetensors` weights over pickle files; pin model revisions in production.
