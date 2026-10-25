**Ollama** is a developer-friendly tool for running open LLMs locally with a one-line workflow, like "Docker for LLMs". Under the hood it uses an inference runtime based on **llama.cpp/ggml** (with its own engine additions) and adds packaging, model management and an API.

**Architecture**

```text
CLI / apps (Open WebUI, LangChain, IDE plugins)
   -> Ollama server (local daemon, REST API on localhost:11434; OpenAI-compatible /v1 endpoints)
        -> Model manager (registry pull/push, layered blobs, quantised GGUF models, Modelfiles)
        -> Scheduler (loads models on demand, keeps them in memory for a TTL, unloads when idle,
                      handles concurrent requests/parallelism and GPU/CPU placement)
        -> Runner (llama.cpp-style inference: CUDA, Metal, ROCm, CPU)
```

**Workflow**

```bash
ollama pull llama3.1:8b          # downloads a quantised model from the registry
ollama run llama3.1:8b           # interactive chat
curl http://localhost:11434/api/chat -d '{"model":"llama3.1:8b","messages":[{"role":"user","content":"Hi"}]}'
```

**Modelfile** customises a model: base model, system prompt, parameters (temperature, context length), chat template, adapters:

```text
FROM llama3.1:8b
PARAMETER temperature 0.2
SYSTEM "You are a concise SQL assistant."
```

**Features:** automatic hardware detection and GPU offload, streaming responses, embeddings, tool calling and structured outputs for supported models, multimodal models, simple model library and tags (sizes/quantisations).

**Best for:** local development and prototyping, privacy-sensitive or offline use, demos, personal assistants, edge devices.

**Limits:** not designed for high-concurrency, multi-tenant production serving (lower throughput than vLLM/SGLang/TensorRT-LLM, limited scheduling control and observability); quantised model quality trade-offs; default context lengths may be small; manage memory carefully for large models.
