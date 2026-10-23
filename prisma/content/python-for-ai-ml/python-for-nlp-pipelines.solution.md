**Pipeline stages**

1. **Clean text:** lowercase, strip HTML/noise, normalise whitespace (`re`, `str` methods).
2. **Tokenise:** split into words or sub-words (`nltk`, `spaCy`, or a Hugging Face tokenizer).
3. **Normalise:** stop-word removal, stemming or lemmatisation (`nltk`, `spaCy`).
4. **Vectorise:** turn text into numbers: TF-IDF/bag-of-words (`scikit-learn`), or embeddings (`sentence-transformers`).
5. **Model:** linear classifier on TF-IDF, or a fine-tuned transformer.
6. **Evaluate and serve:** precision/recall/F1, then wrap in an API.

**Classical pipeline**

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline

clf = make_pipeline(TfidfVectorizer(stop_words="english", ngram_range=(1, 2)),
                    LogisticRegression(max_iter=1000))
clf.fit(train_texts, train_labels)
```

**Transformer pipeline**

```python
from transformers import pipeline
sentiment = pipeline("sentiment-analysis")
sentiment("The delivery was late but support fixed it quickly.")
```

**Difference:** classical pipelines need heavy manual preprocessing (stop words, stemming). Transformers use their own sub-word tokenizer and learned contextual embeddings, so you usually skip stemming and stop-word removal and keep the raw text, because context matters to the model.
