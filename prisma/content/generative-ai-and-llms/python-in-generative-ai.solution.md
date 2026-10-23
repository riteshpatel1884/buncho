**Where Python is used in GenAI**

- **Training and fine-tuning:** PyTorch, Hugging Face `transformers`, `peft` (LoRA), `trl`, `accelerate`, `deepspeed`.
- **Calling hosted models:** official SDKs (Anthropic, OpenAI, Google) are Python-first, so a model call is a few lines.
- **Application frameworks:** LangChain, LlamaIndex, and agent frameworks for RAG, tools and workflows.
- **Retrieval stack:** `sentence-transformers`, FAISS, Chroma, pgvector clients.
- **Serving:** FastAPI, vLLM, Hugging Face TGI.
- **Prompt engineering and automation:** string templating, JSON/structured output parsing with Pydantic, evaluation scripts.

```python
from transformers import AutoTokenizer, AutoModelForCausalLM

name = "Qwen/Qwen2.5-0.5B-Instruct"
tok = AutoTokenizer.from_pretrained(name)
model = AutoModelForCausalLM.from_pretrained(name)

ids = tok("Explain RAG in one sentence.", return_tensors="pt")
out = model.generate(**ids, max_new_tokens=40)
print(tok.decode(out[0], skip_special_tokens=True))
```

**Why it matters:** new models, papers and tooling appear first in Python, the community is the largest, and one language spans prototype, evaluation and production service. The trade-off is that production inference engines (vLLM, TensorRT-LLM) put the hot path in C++/CUDA while Python orchestrates.
