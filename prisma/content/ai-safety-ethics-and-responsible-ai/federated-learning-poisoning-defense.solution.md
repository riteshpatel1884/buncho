**Threat:** in FedAvg the server averages client updates, so a malicious client can send **crafted updates** (untargeted degradation, label flipping, **backdoor** with model replacement by scaling updates) and even Sybil-multiply itself. The server cannot see raw data, which makes verification hard.

**Defences**

1. **Robust aggregation** instead of mean:
   - **Coordinate-wise median / trimmed mean**, **Krum / Multi-Krum** (pick updates closest to the others), **geometric median**, **Bulyan**.
   - **Norm clipping** of each update bounds influence of scaled attacks.
2. **Anomaly detection:** cosine similarity to the aggregate/historical direction, update-norm outliers, clustering (FoolsGold for sybils), validation of each update on a **server-side clean validation set** (reject if loss rises).
3. **Backdoor-specific:** differential privacy noise (clip + noise) weakens backdoors, **FLAME/CRFL** style defences, fine-pruning, test for triggers and activation anomalies.
4. **Participation controls:** client authentication and attestation (TEEs), reputation and trust scores, limit per-round participation of any one client, rate-limit new clients to prevent Sybil attacks.
5. **Secure aggregation** protects privacy but hides individual updates; combine with norm bounds enforced via **zero-knowledge proofs** or secure range checks.
6. **Operations:** monitor global model metrics each round, **checkpoint and roll back**, exclude and ban offenders, and audit logs.

```python
import numpy as np
def trimmed_mean(updates, trim=0.1):
    U = np.sort(np.stack(updates), axis=0)       # per-coordinate sort across clients
    k = int(len(updates) * trim)
    return U[k:len(updates)-k].mean(axis=0)
```

**Trade-offs:** robust aggregators lose accuracy under non-IID data (honest clients look like outliers); DP costs utility; none is bulletproof against adaptive attackers, so layer defences and assume a bounded fraction of malicious clients.
