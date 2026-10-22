```python
def standardize(batch):
    batch -= batch.mean(axis=0)
    batch /= batch.std(axis=0)
    return batch

X = np.random.rand(100, 5)
X_val = X[:20]
X_val_std = standardize(X_val)
print(X[:20].mean())        # expected about 0.5, but it is about 0
```

Also, calling `standardize` on an integer array raises an error. Explain both problems and write a safe version. What else is wrong with computing the mean and std on the validation batch itself?
