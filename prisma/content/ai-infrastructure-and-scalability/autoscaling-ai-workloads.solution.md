**Why AI autoscaling is different:** GPUs are expensive; replicas take **minutes** to start (node provisioning, image pull, loading tens of GB of weights, warm-up, CUDA graphs); CPU utilisation is a poor load signal; requests are long-lived and variable (seconds to minutes).

**Scaling signals (best to worst)**

- **Queue depth / pending requests** and **in-flight sequences per replica** (e.g. vLLM `num_requests_waiting`, `num_requests_running`).
- **KV-cache utilisation** and **TTFT/TPOT SLO violations** (p95).
- Requests per second or tokens per second per replica against a **load-tested capacity** (max concurrency meeting SLO).
- GPU utilisation / DCGM metrics (secondary; can read 100% yet have headroom).

**Kubernetes pattern**

```yaml
# KEDA ScaledObject on Prometheus queue metric
triggers:
- type: prometheus
  metadata:
    query: sum(vllm:num_requests_waiting) / count(up{job="vllm"})
    threshold: "4"          # scale out when >4 queued requests per replica
minReplicaCount: 2          # keep warm replicas
maxReplicaCount: 20
cooldownPeriod: 600         # scale in slowly
```

HPA with custom metrics, KEDA, Knative, Ray Serve autoscaler, KServe, cloud managed endpoints (SageMaker, Vertex), and **cluster autoscaler/Karpenter** for GPU nodes.

**Policies**

- **Scale out fast, scale in slowly** with stabilisation windows (avoid flapping and eviction of warm caches).
- **Maintain headroom:** keep minimum warm replicas and target 60 to 70% of tested capacity.
- **Predictive/scheduled scaling** for known daily or event patterns; pre-warm before peaks.
- **Reduce cold start:** pre-pulled images, weights on local NVMe or shared cache, model streaming (safetensors, fastsafetensors, Run:ai Model Streamer), snapshotting.
- **Capacity mix:** reserved/on-demand baseline, spot/preemptible for burst with graceful drain and retries; multiple regions/providers or overflow to API models.
- **Right-sizing and bin-packing:** MIG/MPS for small models, separate pools for prefill and decode, per-model scaling in multi-model clusters.
- **Protect during lag:** queueing with limits, load shedding, rate limiting, degrade to smaller model, return 429 with retry-after.

**Cost controls:** budgets, scale-to-zero for rarely used models (accept cold start), utilisation dashboards, $/million-token tracking.
