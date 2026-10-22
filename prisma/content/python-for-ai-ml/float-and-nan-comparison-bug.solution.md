1. **`0.1 + 0.2 == 0.3` is False.** Binary floating point cannot represent most decimal fractions exactly: the sum is `0.30000000000000004`. Compare with a tolerance:

```python
import math, numpy as np
math.isclose(0.1 + 0.2, 0.3)                 # True (relative tolerance)
np.allclose(a, b, rtol=1e-5, atol=1e-8)      # arrays; or torch.allclose
```
In tests use `pytest.approx` or `np.testing.assert_allclose`. Use `decimal.Decimal` for money.

2. **NaN is not equal to anything, including itself.** `nan == nan` is False, so `score == float("nan")` never fires. Use `math.isnan(score)`, `np.isnan(arr)` or `pd.isna(obj)`. (`score != score` is a classic trick that works, but `isnan` is clearer.) Also, `nan in [nan]` can be True only because the same object is found by identity, which is unreliable.

3. **NaN propagates:** any arithmetic with NaN gives NaN, so `max` and `mean` return `nan`. Use `np.nanmax`, `np.nanmean`, or `np.nan_to_num` / masking after deciding what missing means. pandas methods skip NaN by default (`skipna=True`), NumPy does not.

4. **groupby drops NaN keys** by default (`dropna=True`), so rows with missing segments silently vanish from the report. Use `groupby("segment", dropna=False)` or fill the missing value with an explicit label first.

**ML angle:** a `nan` loss usually comes from `log(0)`, division by zero, exploding gradients or bad input data. Add `assert np.isfinite(x).all()` checks at pipeline boundaries, and detect with `torch.isnan`/anomaly mode.
