You have a matrix `docs` of shape `(N, D)` with embeddings and a query vector of shape `(D,)`.

Write `top_k_cosine(query, docs, k)` returning indices and scores of the `k` most similar rows, using only NumPy. Make it efficient for `N` around one million, and say what you would do beyond that.
