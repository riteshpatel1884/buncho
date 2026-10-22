```python
model.train()
losses, running = [], 0
for x, y in train_loader:
    x, y = x.cuda(), y.cuda()
    out = model(x)
    loss = criterion(out, y)
    loss.backward()
    optimizer.step()
    losses.append(loss)
    running += loss

print("avg loss", running / len(train_loader))

correct = 0
for x, y in val_loader:
    preds = model(x.cuda()).argmax(1)
    correct += (preds.cpu() == y).sum()
```

GPU memory grows until out-of-memory, training is unstable, and validation accuracy fluctuates between runs. List all the bugs and fix them.
