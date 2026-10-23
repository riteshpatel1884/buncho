**1. Confirm and quantify**

Bucket evaluation images by mean brightness and plot accuracy per bucket. If only the dark bucket collapses, it is a **distribution shift** (train data lacks low-light examples), not a general model problem. Also check blur and sensor noise, which often come with low light.

**2. Fix the data (best long-term fix)**

- Collect and label real low-light images, ideally from the deployment cameras.
- Make sure every class has dark examples, not just a few.

**3. Augmentation (cheap, quick)**

```python
import torchvision.transforms as T

train_tf = T.Compose([
    T.RandomResizedCrop(224),
    T.ColorJitter(brightness=(0.2, 1.3), contrast=0.4),   # simulate dark/bright scenes
    T.RandomApply([T.GaussianBlur(5)], p=0.2),
    T.ToTensor(),
    T.Lambda(lambda x: (x + 0.02 * torch.randn_like(x)).clamp(0, 1)),  # sensor noise
    T.Normalize(mean, std),
])
```

Use gamma changes or synthetic darkening plus noise so the augmentation matches real low-light physics.

**4. Preprocessing at inference**

- Histogram equalisation (CLAHE), gamma correction, or a low-light enhancement model before classification. Apply the **same** step in training and serving.

**5. Model and training**

- Fine-tune the existing model on the mixed dataset with a low learning rate.
- Try a more robust backbone; consider test-time augmentation.

**6. Prevent regressions**

Keep a dark-image test set, report accuracy per condition, and monitor brightness distribution in production. If the model is uncertain on dark inputs, route to a fallback or human review.
