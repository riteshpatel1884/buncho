**Why go multi-region:** lower latency for global users, **data residency/sovereignty** (EU, India, etc.), resilience to regional outages, and access to GPU capacity wherever it exists.

**Key considerations**

1. **Data residency and compliance:** where prompts, outputs, logs, embeddings, fine-tuning data and backups may live and be processed (GDPR, DPDP, sector rules). Region-pinned processing and storage; no cross-border replication of regulated data; provider data-processing agreements and "no training" terms.
2. **GPU capacity and cost:** GPUs are scarce and unevenly priced by region; reserve capacity, use model-size tiers, and avoid duplicating the largest model everywhere if traffic does not justify it.
3. **Model availability parity:** not every provider region offers every model; maintain a **model-region matrix** and fallbacks; keep versions consistent to avoid inconsistent behaviour.
4. **Routing:** geo-DNS/anycast and a global load balancer to the nearest healthy region, with **residency-aware routing** (EU users stay in EU), and failover rules that respect those constraints.
5. **State and data replication:**
   - Vector indexes and knowledge bases: replicate per region (build once, ship snapshots) with versioned, atomically promoted indexes.
   - Conversation/memory state: home-region storage per user, or replicated with consistency rules; avoid cross-region round trips in the hot path.
   - Config, prompts, model registry: global control plane, regional data planes.
6. **Consistency of experiments and prompts:** the same prompt/model versions rolled out region by region with canaries.
7. **Latency components:** keep retrieval, LLM and tools in the same region; cross-region calls add 50 to 300 ms each.
8. **Observability:** unified metrics/traces tagged by region, regional SLOs, cost allocation per region.
9. **Disaster recovery:** RTO/RPO targets, tested failover runbooks, capacity headroom in secondary regions (or autoscale with warm pools, noting GPU cold starts).
10. **Security:** per-region keys (KMS), network isolation, consistent policy enforcement.

**Recommended pattern:** **global control plane + regional data planes**, active-active for stateless inference, region-pinned data for regulated users, residency-aware global routing with regional fallback and cross-provider backup.

**Trade-offs:** complexity and cost vs latency, availability and compliance; start with two regions plus a tested failover and expand where traffic or regulation demands.
