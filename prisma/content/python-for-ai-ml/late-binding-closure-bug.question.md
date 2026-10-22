A teammate builds scaling functions for several feature indexes, but every function behaves the same.

```python
scalers = [lambda x: x * i for i in range(3)]
print([f(10) for f in scalers])     # expected [0, 10, 20]
```

What is printed, why, and how do you fix it (two ways)?
