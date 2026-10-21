## Definition

An **embedding** maps a discrete object (a token, word, sentence, image, user, product) to a **dense vector of real numbers**, typically 256 to 4096 dimensions, such that **geometric closeness reflects semantic similarity**.

## Why not one-hot vectors?

A one-hot vector has length $V$ (tens of thousands), is almost all zeros, and every pair of words is equally distant. An embedding is compact, dense and **learned**, so "cat" ends up near "kitten" and far from "invoice".

## How token embeddings work in an LLM

- An embedding matrix $E\in\mathbb{R}^{V\times d}$. Looking up token ID $i$ simply returns row $i$.
- $E$ is **trained jointly with the rest of the network** by backpropagation on the next-token loss; nothing hand-crafts the meaning.
- Many models **tie weights**, reusing $E^\top$ as the output projection, which saves parameters.
- After the Transformer layers, the same token gets a different, **contextual** vector depending on its neighbours ("bank" near "river" vs "loan").

## Static vs contextual vs sentence embeddings

| Type | Example | Property |
|---|---|---|
| Static word vectors | Word2Vec, GloVe | One vector per word, ignores context |
| Contextual token vectors | Hidden states of BERT or an LLM | Depends on the surrounding sentence |
| Sentence or document embeddings | Sentence-BERT, OpenAI and Cohere embedding models | One vector per passage, trained **contrastively** so similar texts are close; used for search and RAG |
| Multimodal | CLIP | Text and images share one space |

## Measuring similarity

- **Cosine similarity** $\dfrac{a\cdot b}{\|a\|\|b\|}$: compares direction, the usual default for text.
- **Dot product:** equals cosine for normalised vectors, and is fastest.
- **Euclidean distance:** compares magnitude as well.

## Uses

Semantic search and **RAG retrieval**, clustering, classification features, recommendations, deduplication, anomaly detection.

## Pitfalls

- Embeddings from different models are **not comparable**; changing the model means re-embedding everything.
- Dimensionality trades quality against storage and search cost.
- They encode biases present in the training data.
- A model's input token embedding table is not the same thing as a retrieval embedding model; use a model trained for the task.
