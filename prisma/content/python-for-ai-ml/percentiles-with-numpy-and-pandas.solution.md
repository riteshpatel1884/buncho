```python
import numpy as np
import pandas as pd

lat = np.array([120, 130, 125, 140, 135, 128, 900, 132, 138, 126])   # ms; one slow outlier

p50, p95, p99 = np.percentile(lat, [50, 95, 99])       # percentiles use 0-100
assert np.isclose(np.quantile(lat, 0.95), p95)         # quantiles use 0-1: same result
assert p50 < lat.mean()                                # the mean is dragged up by the outlier
assert p95 > 400                                       # the tail is visible

s = pd.Series(lat)
assert np.isclose(s.quantile(0.95), p95)
print(s.describe(percentiles=[0.5, 0.95, 0.99]))

# Winsorise: clip extreme values to the 1st and 99th percentile of the TRAIN data only.
lo, hi = np.percentile(lat, [1, 99])
clipped = np.clip(lat, lo, hi)
assert clipped.max() <= hi

# NaN-safe versions.
with_nan = np.append(lat.astype(float), np.nan)
assert np.isnan(np.percentile(with_nan, 95))           # plain percentile propagates NaN
assert np.isclose(np.nanpercentile(with_nan, 95), p95)

# Interpolation changes the answer on small samples.
x = np.array([1, 2, 3, 4])
assert np.percentile(x, 50) == 2.5                     # default: linear interpolation
assert np.percentile(x, 50, method="lower") == 2       # NumPy >= 1.22 uses `method`
```

**Where percentiles matter**

- **Latency and cost reporting:** p50 shows the typical request, p95/p99 show what users in the tail feel. The mean hides them. Compute percentiles over raw samples or histograms, and never average per-minute percentiles.
- **Outlier handling:** winsorising or clipping at percentile bounds, with the bounds learned on **training data only** to avoid leakage.
- **Thresholds and binning:** quantile bins (`pd.qcut`), setting an anomaly cut-off at the 99th percentile of normal scores, and picking a similarity threshold from a score distribution.
- **Data audits:** token-length percentiles to choose a `max_length` that truncates only about 1% of examples.

The default method is linear interpolation. Different libraries (and old NumPy versions) use different definitions, so state which one you used when you compare numbers.
