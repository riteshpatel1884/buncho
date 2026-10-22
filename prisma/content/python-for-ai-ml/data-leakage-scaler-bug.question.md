```python
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, shuffle=True)

selector = SelectKBest(f_classif, k=20).fit(X_scaled, y)
model = LogisticRegression().fit(selector.transform(X_train), y_train)
print(model.score(selector.transform(X_test), y_test))     # 0.97
```

In production the same model scores much lower. The data is daily user events over 18 months. Find every leakage problem and fix the code.
