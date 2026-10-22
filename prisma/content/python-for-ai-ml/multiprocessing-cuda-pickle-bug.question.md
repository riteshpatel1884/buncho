```python
import torch, multiprocessing as mp

model = Net().cuda()

def predict(batch):
    return model(batch.cuda()).cpu()

if True:
    with mp.Pool(4) as pool:
        results = pool.map(lambda b: predict(b), batches)
```

The script fails with `Can't pickle local object` / `Can't pickle <function <lambda>>` and, after you remove the lambda, with `RuntimeError: Cannot re-initialize CUDA in forked subprocess`. Explain both errors and give a correct design.
