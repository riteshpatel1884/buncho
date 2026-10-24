**Why on-device:** privacy (data stays local), **offline** use, low latency, no per-token server cost. **Constraints:** limited RAM (4 to 16 GB shared), battery/thermal limits, NPU/GPU variety, storage for models.

**Architecture**

```text
UI/voice input -> Orchestrator (on device)
   -> Intent router: [simple/private tasks -> local SLM] [hard tasks -> cloud (with consent)]
   -> Local SLM (1 to 8B, 4-bit quantised) via llama.cpp / MLC / Core ML / ExecuTorch / NNAPI
   -> Local tools (calendar, contacts, files, device settings) with permissions
   -> Local retrieval: embeddings (small model) + on-device vector index over user data
```

**Model engineering**

- **Small language models** (1 to 8B), **quantisation** (int8/int4; for 7B, 4-bit weights are about 3.5 to 4 GB), pruning/distillation, task-specific **LoRA adapters** swapped at runtime.
- **KV cache** memory is a limit for long contexts: shorter contexts, quantised/sliding-window cache.
- Use hardware: NPU/GPU delegates, memory-mapped weights for fast start, speculative decoding with a tiny draft model.

**Hybrid cloud fallback:** decide by task difficulty, battery, connectivity and privacy class; send the minimum necessary data, with explicit user consent and redaction.

**Operations:** model download/update (delta updates, integrity checks, rollback), background scheduling, thermal throttling, telemetry that respects privacy (opt-in, aggregated, on-device evaluation).

**Safety:** local guardrails, permission prompts for actions, protect model weights and stored data (secure enclave, encryption).

**Trade-offs:** quality vs size, latency vs battery, privacy vs capability. **Metrics:** tokens/s, time to first token, memory peak, battery per query, task success vs cloud baseline, fallback rate.
