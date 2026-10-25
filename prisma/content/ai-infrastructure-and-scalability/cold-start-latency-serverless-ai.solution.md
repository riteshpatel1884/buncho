**Cold start** = time from a request arriving with no ready instance to the first token. For LLMs it can be **30 s to several minutes**.

**Where the time goes**

| Stage | Typical | Fix |
|---|---|---|
| Provision GPU node/VM | 30 s to minutes | Warm node pool, over-provisioned buffer, reserved capacity |
| Pull container image (10 to 30 GB with CUDA/PyTorch) | 30 to 120 s | Slim images, **pre-pulled** images on nodes, image streaming (lazy pulling, Nydus/SOCI), layer caching |
| **Download and load weights** (e.g. 14 GB to 140 GB) | 30 s to minutes | Local NVMe cache or shared volume (FSx/Lustre/EFS), **safetensors + mmap**, parallel/streamed loading (Run:ai Model Streamer, fastsafetensors), GPUDirect Storage, smaller/quantised weights |
| Runtime init (CUDA context, kernel compile, CUDA graphs capture, torch.compile) | 10 to 60 s | Cache compile artefacts/engines (TensorRT engines, torch inductor cache), reduce captured batch sizes, `--enforce-eager` trade-off |
| Warm-up / first request JIT | seconds | Dummy warm-up requests before marking ready |

**Strategies**

1. **Keep minimum warm replicas** (`min_instances=1`) for latency-critical endpoints; scale to zero only for rarely used models.
2. **GPU/process snapshotting:** checkpoint-restore of initialised CUDA state and loaded weights (Modal GPU snapshots, CRIU + CUDA checkpoint, Cerebrium/Baseten approaches) cuts starts to a few seconds.
3. **Model loading tricks:** keep weights in host memory/page cache on the node, share across processes, tiered cache (S3 → NVMe → GPU), start serving **layer-by-layer** while loading (experimental).
4. **Predictive scaling:** scale ahead of known traffic; use queues and scheduled warm-ups.
5. **Hide the delay:** return an immediate acknowledgement and process async, use smaller fast-start model or API fallback while the big model boots, stream a loading status.
6. **Right-size the model:** distilled/quantised models start faster and fit cheaper GPUs.
7. **Platform choice:** serverless GPU providers (Modal, RunPod serverless, Replicate, Baseten, SageMaker serverless/async, Cloud Run GPU) differ widely in cold-start performance; benchmark.

**Measure:** cold vs warm TTFT, p99 including cold starts, cold-start frequency, and cost of the warm pool vs user impact; set an SLO and decide the minimum warm capacity from it.
