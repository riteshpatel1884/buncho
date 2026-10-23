**Sources of randomness**

1. **Weight initialisation:** random initial weights.
2. **Data shuffling and splitting:** `train_test_split`, `DataLoader(shuffle=True)`.
3. **Dropout and augmentation:** random masks and transforms.
4. **Algorithm randomness:** random forests, k-means initialisation, SGD mini-batches.
5. **Hardware/library non-determinism:** GPU atomics, cuDNN algorithm selection, parallel reductions where float addition order changes the result.
6. **Multi-worker data loading:** each worker has its own random state.

**Fixes**

```python
import os, random
import numpy as np
import torch

def set_seed(seed: int = 42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    os.environ["PYTHONHASHSEED"] = str(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False
    torch.use_deterministic_algorithms(True, warn_only=True)

set_seed(42)

g = torch.Generator().manual_seed(42)
loader = torch.utils.data.DataLoader(ds, batch_size=32, shuffle=True, generator=g,
                                     worker_init_fn=lambda w: np.random.seed(42 + w))
```

```python
# scikit-learn: pass random_state everywhere
train_test_split(X, y, random_state=42)
RandomForestClassifier(random_state=42)
```

```python
# TensorFlow / Keras
import tensorflow as tf
tf.keras.utils.set_random_seed(42)
tf.config.experimental.enable_op_determinism()
```

**Caveats**

- Full determinism can slow training and some ops have no deterministic version.
- Different hardware or library versions can still change results; pin versions and record the seed, commit hash and config.
- Do not "seed hack": report the **mean and standard deviation over several seeds** so that you know whether an improvement is real.
