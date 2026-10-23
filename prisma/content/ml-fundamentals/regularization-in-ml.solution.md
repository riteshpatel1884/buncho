**Idea:** regularization discourages overly complex models so they generalise instead of memorising noise. It trades a little bias for a larger drop in variance (see bias-variance).

**Penalised loss**

`L_total = L_data + lambda * R(w)`

- **L2 (Ridge / weight decay):** `R(w) = sum(w_i^2)`. Shrinks all weights smoothly toward zero, rarely exactly zero. Good default, handles correlated features.
- **L1 (Lasso):** `R(w) = sum(|w_i|)`. Pushes many weights to exactly zero, so it performs **feature selection** and gives sparse models.
- **Elastic Net:** mix of both.
- `lambda` (or `alpha`) controls strength: too high underfits, too low overfits. Tune by cross-validation.

```python
from sklearn.linear_model import Ridge, Lasso
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

ridge = make_pipeline(StandardScaler(), Ridge(alpha=1.0))
lasso = make_pipeline(StandardScaler(), Lasso(alpha=0.05))   # scale first: penalties depend on feature scale
```

**Other techniques (deep learning)**

- **Dropout:** randomly zero activations during training.
- **Early stopping:** stop when validation loss stops improving.
- **Data augmentation** and more data.
- **Weight decay** in AdamW (decoupled L2).
- **Batch norm / label smoothing** have mild regularising effects.
- **Smaller model or pruning.**

**Why scale features:** penalties treat all coefficients equally, so unscaled features are penalised unfairly.
