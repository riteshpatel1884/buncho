**Threats:** code that deletes files, reads secrets (env vars, cloud metadata), exfiltrates data over the network, mines crypto, consumes CPU/memory/disk, escapes the sandbox, or attacks other tenants. Prompt injection can cause an otherwise honest agent to write such code.

**Isolation layers (defence in depth)**

| Layer | Controls |
|---|---|
| **Strong isolation boundary** | MicroVMs (Firecracker), gVisor, or hardened containers; one **fresh sandbox per session or run**; never run on the host or in the app server |
| **Least privilege** | Non-root user, read-only root filesystem, writable temp dir only, drop Linux capabilities, seccomp profile |
| **Network** | **Default deny egress**; allow-list specific hosts (package mirror, approved APIs); block cloud metadata endpoints |
| **Resources** | CPU, memory, disk, process count, and wall-clock **timeouts**; kill runaway jobs |
| **Secrets** | No credentials in the sandbox; the agent calls vetted tools/APIs that hold credentials outside |
| **Data** | Mount only the user's input files; per-tenant storage; wipe after the run |
| **Dependencies** | Pre-built image with approved packages; pinned versions; no arbitrary `pip install` (or via a vetted mirror) |
| **Output** | Size limits; scan returned files; treat output as untrusted (do not execute or render raw HTML) |
| **Observability** | Log code, stdout/stderr, resource use; alert on anomalies |

```python
result = sandbox.run(
    code=generated_code,
    image="python-data:2026-10",          # pinned, pre-built
    files={"/data/input.csv": upload},    # only what the task needs
    network="none",
    cpu=1, memory_mb=1024, timeout_s=30,
    user="nobody", read_only_root=True,
)
```

**Agent-level controls:** static checks (block obviously dangerous imports as a first filter, not as the main defence), human approval for actions with external effects, and returning clear errors so the agent can fix its code.

**Operations:** per-user quotas, pool of pre-warmed sandboxes for latency, regular patching, and security testing (escape attempts, resource exhaustion, injection-driven attacks). Managed options exist (E2B, Modal, Daytona, cloud-provider sandboxes) if you do not want to operate this yourself.
