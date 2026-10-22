## Short answer

Dot products grow with the dimension $d_k$. Without scaling, the scores fed to softmax get large, softmax **saturates** into a near one-hot distribution, and its **gradients vanish**. Dividing by $\sqrt{d_k}$ keeps the score variance at about 1 regardless of $d_k$.

## The math

Assume the components of a query $q$ and key $k$ are independent with mean 0 and variance 1 (a reasonable assumption at initialisation, and what layer norm roughly maintains). The dot product is

$$q\cdot k=\sum_{i=1}^{d_k}q_ik_i$$

Each term has mean $0$ and variance $E[q_i^2]E[k_i^2]=1$. Terms are independent, so variances add:

$$\mathbb{E}[q\cdot k]=0,\qquad \text{Var}(q\cdot k)=d_k,\qquad \text{std}=\sqrt{d_k}$$

Dividing by $\sqrt{d_k}$ gives

$$\text{Var}\!\left(\frac{q\cdot k}{\sqrt{d_k}}\right)=\frac{d_k}{d_k}=1$$

So the scaled scores stay in a stable range whatever the head size (64 or 128 are typical).

## Why large scores are a problem

For $p=\text{softmax}(s)$, the Jacobian is

$$\frac{\partial p_i}{\partial s_j}=p_i(\delta_{ij}-p_j)$$

If one score is much bigger than the others, softmax returns almost exactly $p_i\approx1$ for it and $\approx0$ elsewhere. Then $p_i(1-p_i)\approx0$, so **almost no gradient flows** to the scores and therefore to $W_Q$ and $W_K$. Training stalls or becomes unstable. Large magnitudes also hurt numerical precision in fp16/bf16.

## Quick numeric feel

With $d_k=64$ the unscaled standard deviation is 8, so score differences of 15 to 20 are common. $e^{16}$ is about $9\times10^{6}$, so one key takes essentially all the attention. After scaling, the std is 1 and the distribution stays soft enough to learn from.

## Why $\sqrt{d_k}$ and not $d_k$?

Because the standard deviation grows as $\sqrt{d_k}$. Dividing by $d_k$ would over-shrink the scores toward uniform attention. The goal is unit variance, not zero.

## Notes

- The original paper observed that additive attention beats unscaled dot-product attention for larger $d_k$, and that scaling closes the gap while keeping dot-product's speed (it is a highly optimised matrix multiply).
- The variance argument is an initialisation-time heuristic. In trained models scores can grow, which is why some architectures add **QK-norm** (normalising queries and keys) to prevent attention logit blow-up.
- Scaling controls the sharpness of the attention distribution, much like **temperature** in sampling.
