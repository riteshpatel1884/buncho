**Step 0: diagnose**

- Compare train vs validation score. Both low -> underfitting (features/model too weak). Train high, validation low -> overfitting or distribution mismatch.
- Look at the confusion matrix and 50 misclassified examples. Are labels noisy? Are classes imbalanced? Is the text truncated?

**Step 1: data (usually the biggest win)**

- Fix label noise and inconsistent annotation guidelines.
- Handle imbalance: class weights, resampling, per-class metrics instead of accuracy.
- Add more examples for weak classes; augment (back-translation, synonym replacement) cautiously.

**Step 2: preprocessing and features**

- Clean text, keep useful tokens (do not remove negations like "not").
- TF-IDF with word and character n-grams as a strong baseline.
- Upgrade to embeddings: sentence-transformer vectors + logistic regression.

**Step 3: model**

- Fine-tune a pre-trained transformer (BERT/DistilBERT/RoBERTa); this typically gives the largest jump.
- Or use an LLM with few-shot prompts as a baseline/labeller.

**Step 4: tuning and evaluation**

- Cross-validated hyperparameter search, early stopping, threshold tuning.
- Evaluate with F1/precision/recall per class on a held-out set.

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import GridSearchCV

pipe = make_pipeline(TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True, min_df=2),
                     LinearSVC(class_weight="balanced"))
grid = GridSearchCV(pipe, {"linearsvc__C": [0.1, 1, 10]}, scoring="f1_macro", cv=5)
grid.fit(X_train, y_train)
```

**Principle:** change one thing at a time against a fixed validation set so you know what helped.
