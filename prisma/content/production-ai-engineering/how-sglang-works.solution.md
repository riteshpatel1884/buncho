**SGLang** is an open-source serving framework and programming language for LLM applications (from LMSYS/UC Berkeley) that co-designs a **fast runtime** with a **frontend for structured, multi-call LLM programs**.

**Runtime innovations**

1. **RadixAttention (automatic prefix caching):** stores KV cache of all processed token sequences in a **radix tree** keyed by tokens. A new request walks the tree, reusing the KV of its longest matching prefix, with **LRU eviction** of leaves and cache-aware scheduling. This shines when many calls share context: few-shot prompts, multi-turn chat history, RAG with common documents, **agent loops**, tree-of-thought/branching and self-consistency.
2. **Compressed finite-state machines for constrained decoding:** structured outputs (JSON schema, regex) are enforced via grammars; jumping over deterministic tokens (e.g. fixed JSON keys) lets the engine **decode multiple tokens at once**, giving large speedups over token-by-token masking.
3. **Efficient scheduling:** continuous batching, chunked prefill, zero-overhead CPU scheduler, optimised kernels (FlashInfer), quantisation (FP8, AWQ, GPTQ), tensor/expert/data parallelism, speculative decoding, prefill-decode disaggregation, multi-LoRA.

**Frontend language (optional):** Python primitives such as `gen`, `select`, `fork`/`join` and role helpers for writing multi-step LLM programs that the runtime can optimise (parallel branches share the prefix).

```python
import sglang as sgl
@sgl.function
def extract(s, doc):
    s += sgl.system("Extract fields as JSON.") + sgl.user(doc)
    s += sgl.assistant(sgl.gen("out", max_tokens=200, regex=r'\{"name": "[^"]+", "age": \d+\}'))
```

**Strengths:** very good for **prefix-heavy and structured workloads**, strong performance on DeepSeek/MoE models at scale, OpenAI-compatible server. **Trade-offs:** younger ecosystem than vLLM; feature coverage and hardware support evolve quickly; radix cache memory competes with batch size.
