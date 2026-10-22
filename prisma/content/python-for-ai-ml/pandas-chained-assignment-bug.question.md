```python
df = pd.DataFrame({"score": [0.2, 0.7, 0.9, 0.4], "label": 0})

df[df["score"] > 0.5]["label"] = 1
print(df["label"].tolist())        # expected [0, 1, 1, 0] but prints [0, 0, 0, 0]
```

A `SettingWithCopyWarning` appears. Explain the bug and fix it. Then comment on this variant:

```python
high = df[df["score"] > 0.5]
high["label"] = 1
```
