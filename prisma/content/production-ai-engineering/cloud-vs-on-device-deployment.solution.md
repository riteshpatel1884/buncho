| Factor | **Cloud** | **On-device (edge)** | **Hybrid** |
|---|---|---|---|
| Model size/quality | Largest, most capable models | Small models (about 1 to 8B, quantised), narrower capability | Local for easy tasks, cloud for hard |
| Latency | Network round trip + queueing; high peak compute | No network; low for small models; limited by device speed | Fast path locally |
| Privacy | Data leaves device (needs trust, contracts, encryption) | **Data stays local** | Send only minimal, consented data |
| Offline use | No | **Yes** | Partial |
| Cost | Pay per token or GPU; scales with usage | Zero marginal inference cost to you; uses user's hardware and battery; one-time distribution cost | Mixed |
| Updates | Instant, centralised | App/model updates, fragmentation | Mixed |
| Hardware variance | Controlled | Many devices (NPU/GPU/RAM) to support | Both |
| Scalability | Elastic but needs capacity planning | Scales with number of devices | Both |
| Observability | Full | Limited, privacy-restricted telemetry | Partial |
| Security | Server compromise risk | Model weights extractable, local attacks | Both |

**Choose on-device when:** privacy/regulation, offline, ultra-low latency, high-volume low-complexity tasks (keyboard suggestions, transcription, classification, summarising a note), or you want to avoid per-token costs.

**Choose cloud when:** you need frontier capability, large context, heavy retrieval or tools, rapid iteration, centralised control and monitoring.

**Hybrid patterns:** a **router** decides per request by difficulty, battery/connectivity, privacy class and cost; on-device models handle PII redaction or prefiltering before the cloud; speculative or cascaded designs (small local draft, cloud verification); on-device embeddings/retrieval with cloud generation.

**On-device engineering:** small models, quantisation (4-bit), distillation, adapters, runtimes (llama.cpp, MLC, Core ML, ExecuTorch, ONNX Runtime, NNAPI), thermal and battery limits, model download size and delta updates, secure storage.

**Decision process:** define task difficulty, privacy, latency and offline requirements, estimate cost at expected volume, benchmark small vs large models on your eval set, and start hybrid if unsure.
