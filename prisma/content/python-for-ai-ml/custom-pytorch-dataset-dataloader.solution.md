```python
import torch
from torch.nn.utils.rnn import pad_sequence
from torch.utils.data import DataLoader, Dataset

PAD_ID = 0

class TextDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_len=128):
        self.texts, self.labels = texts, labels
        self.tok, self.max_len = tokenizer, max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, i):
        ids = self.tok(self.texts[i])[: self.max_len]            # truncate
        return torch.tensor(ids, dtype=torch.long), self.labels[i]

def collate(batch):
    seqs, labels = zip(*batch)
    lengths = torch.tensor([len(s) for s in seqs])
    input_ids = pad_sequence(seqs, batch_first=True, padding_value=PAD_ID)   # (B, L_max)
    attention_mask = torch.arange(input_ids.size(1))[None, :] < lengths[:, None]
    return {
        "input_ids": input_ids,
        "attention_mask": attention_mask.long(),
        "labels": torch.tensor(labels),
    }

loader = DataLoader(TextDataset(texts, labels, tokenize), batch_size=32, shuffle=True,
                    num_workers=4, collate_fn=collate, pin_memory=True,
                    persistent_workers=True)
```

**Explanations**
- The default collate tries to `torch.stack` samples, which fails for different lengths. Padding per batch (to the batch maximum, not a global maximum) saves compute; sorting or bucketing by length saves more.
- The mask is built from **lengths**, not from `input_ids != PAD_ID`, because a real token could share the pad id in some vocabularies.
- `num_workers>0` runs `__getitem__` in worker **processes** so tokenisation overlaps with GPU work. `pin_memory=True` speeds host-to-GPU copies, and `persistent_workers` avoids respawn each epoch.
- Storing millions of Python strings in a list that workers read can inflate memory through copy-on-access refcount updates. Use NumPy arrays, Arrow/Parquet, or memory-mapped files for big datasets.
- Tokenising in `__getitem__` keeps start-up fast; pre-tokenising once and caching is better when tokenisation dominates.
