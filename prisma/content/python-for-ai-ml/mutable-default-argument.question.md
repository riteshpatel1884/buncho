```python
def add_tag(tag, tags=[]):
    tags.append(tag)
    return tags

print(add_tag("a"))
print(add_tag("b"))
print(add_tag("c", ["x"]))
print(add_tag("d"))
```

1. What does this print, and why?
2. Fix the function.
3. Give a realistic ML example where this bug would silently corrupt results.
