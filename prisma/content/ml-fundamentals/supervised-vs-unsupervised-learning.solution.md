| | Supervised | Unsupervised |
|---|---|---|
| Data | Inputs **with labels** `(x, y)` | Inputs only `x` |
| Goal | Learn a mapping `x -> y` | Discover structure in `x` |
| Tasks | Classification, regression | Clustering, dimensionality reduction, anomaly detection, density estimation |
| Algorithms | Logistic/linear regression, trees, SVM, neural nets | k-means, DBSCAN, PCA, autoencoders, Gaussian mixtures |
| Evaluation | Accuracy, F1, RMSE against labels | Indirect: silhouette score, reconstruction error, downstream usefulness |
| Example | Spam detection, price prediction | Customer segmentation, topic discovery |

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.cluster import KMeans

RandomForestClassifier().fit(X, y)     # supervised: needs y
KMeans(n_clusters=4, n_init="auto").fit(X)   # unsupervised: no y
```

**In between**

- **Semi-supervised:** few labels plus many unlabelled examples (pseudo-labelling).
- **Self-supervised:** labels are created from the data itself, e.g. predict the next token (GPT) or a masked token (BERT). This is how foundation models learn from raw text.
- **Reinforcement learning:** learn from reward signals, not labels.

**Trade-off:** supervised learning is easier to evaluate but labelling is costly; unsupervised needs no labels but results are harder to validate.
