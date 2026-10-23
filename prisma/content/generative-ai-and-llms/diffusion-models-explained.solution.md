**Core idea:** learn to reverse a gradual noising process. Start from pure noise and denoise step by step until an image appears.

**Forward process (fixed, no learning):** repeatedly add small Gaussian noise to a real image over `T` steps until it is pure noise.

**Reverse process (learned):** a neural network (a U-Net or a Transformer) takes a noisy image `x_t` and the step `t` and predicts the noise that was added (or equivalently the clean image or velocity).

**Training objective (simple):**

`loss = || epsilon - epsilon_theta(x_t, t) ||^2`

Pick a random image, random `t`, add noise `epsilon`, and train the network to predict it.

```python
# sketch of one training step
t = torch.randint(0, T, (x0.size(0),))
eps = torch.randn_like(x0)
xt = sqrt_ab[t, None, None, None] * x0 + sqrt_1mab[t, None, None, None] * eps
loss = F.mse_loss(model(xt, t), eps)
```

**Generation:** sample `x_T ~ N(0, I)`, then for `t = T..1` predict noise and subtract a bit of it (DDPM/DDIM samplers) to reach `x_0`.

**Text-to-image:** the text prompt is encoded (e.g. CLIP or T5) and injected through **cross-attention**; **classifier-free guidance** blends conditional and unconditional predictions to follow the prompt more strongly. **Latent diffusion** (Stable Diffusion) runs the process in a compressed VAE latent space, which is much cheaper.

**Trade-offs**

- High quality and stable training (no adversarial game like GANs), and good diversity.
- Slow sampling (many steps; mitigated by distillation and fewer-step samplers).
- Can reproduce biases or copyrighted styles; needs safety filtering.
