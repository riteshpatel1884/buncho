Explain assignment, shallow copy and deep copy in Python.

What is printed by the following, and why?

```python
import copy
a = [[1, 2], [3, 4]]
b = a
c = copy.copy(a)
d = copy.deepcopy(a)
a[0].append(99)
print(b, c, d)
```
