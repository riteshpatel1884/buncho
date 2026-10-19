A teammate wrote this helper for building feature lists in a preprocessing pipeline:

~~~python
def add_feature(name, features=[]):
    features.append(name)
    return features

a = add_feature("age")
b = add_feature("income")
print(a, b)
~~~

1. What does this print?
2. Why does it happen?
3. How would you fix it?
