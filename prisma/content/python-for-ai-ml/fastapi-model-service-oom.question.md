**Situation.** A text-classification API runs on FastAPI behind Gunicorn in a container with a 16 GB memory limit. Since the weekend, Kubernetes restarts the pod several times a day with `OOMKilled`. Latency also spikes before each restart. Nothing changed in the model, but the team recently raised the number of workers to improve throughput and added a result cache.

Use the evidence to explain the failures, and propose short-term mitigation, a root-cause fix and a long-term serving design.
