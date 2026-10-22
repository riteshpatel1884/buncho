```python
import numpy as np

def kmeans(X, k, n_iter=100, tol=1e-4, seed=0):
    rng = np.random.default_rng(seed)
    centers = X[rng.choice(len(X), size=k, replace=False)].astype(float)

    for _ in range(n_iter):
        # squared distances (n, k) via ||x||^2 - 2 x.c + ||c||^2  (no (n, k, d) intermediate)
        d2 = (X ** 2).sum(1)[:, None] - 2 * X @ centers.T + (centers ** 2).sum(1)[None, :]
        labels = d2.argmin(axis=1)

        new_centers = centers.copy()
        for j in range(k):
            members = X[labels == j]
            if len(members):
                new_centers[j] = members.mean(axis=0)
            else:                                           # empty cluster: re-seed on a random point
                new_centers[j] = X[rng.integers(len(X))]

        shift = np.linalg.norm(new_centers - centers)
        centers = new_centers
        if shift < tol:
            break

    inertia = d2[np.arange(len(X)), labels].sum()
    return centers, labels, inertia
```

**Discussion points**
- Each iteration alternates **assign** (nearest centroid) and **update** (mean of members). Inertia never increases, so it converges, but only to a **local** optimum.
- Expanding the squared distance turns the assignment into a matrix multiply, which is far faster and lighter on memory than broadcasting `X[:, None] - centers[None]` (that builds an `(n, k, d)` tensor).
- **Empty clusters** would produce `nan` means; re-seeding (or keeping the old centre) avoids that.
- **Improvements:** k-means++ initialisation, multiple restarts (`n_init`) keeping the lowest inertia, mini-batch k-means for huge data, feature scaling first (distance-based), and choosing `k` via elbow/silhouette. In practice use `sklearn.cluster.KMeans` and know how it works.
