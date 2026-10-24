**Goal:** every query returns **only that tenant's data**, with predictable performance and cost.

**Options**

| Strategy | Isolation | Cost / ops | Best for |
|---|---|---|---|
| **Index/collection per tenant** | Strongest | High overhead with many tenants (memory, connections) | Few large or regulated tenants |
| **Namespace / partition per tenant** (inside one index) | Strong, enforced by the engine | Good balance; search touches only that partition | Many small-to-medium tenants |
| **Shared index + `tenant_id` metadata filter** | Logical only | Cheapest, simplest | Many tiny tenants, low sensitivity |
| **Hybrid tiers** | Mix | Moderate | Big tenants get dedicated indexes, small ones share |

**Security**

- Derive `tenant_id` from the **authenticated session on the server**, never from a request parameter the client controls.
- Apply the filter/namespace in **one shared data-access layer** so no query path can omit it.
- Add automated tests that query as tenant A and assert no tenant B ids ever appear; consider row-level or engine-level access control.
- For strict regimes, use separate encryption keys or dedicated deployments.

**Performance**

- A **post-filter** (search first, filter after) can return too few results for small tenants because top-k is dominated by other tenants. Prefer **pre-filtering / filtered ANN** or partitions.
- Graph indexes with very selective filters can lose recall; partitions avoid this.
- Watch for **noisy neighbours**: rate-limit per tenant and size shards by tenant.

```python
results = index.query(
    vector=q_vec, top_k=8,
    namespace=f"tenant-{auth.tenant_id}",     # server-derived, not client-supplied
    filter={"acl": {"$in": auth.groups}},
)
```

**Lifecycle:** per-tenant deletion (right to erasure) is easy with namespaces/collections, harder with a shared index; plan for it, along with per-tenant quotas and monitoring.
