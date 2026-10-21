## Short answer

Dot products of high-dimensional vectors grow in magnitude with the dimension. Without scaling, the softmax receives large logits, saturates to almost one-hot, and its gradients become tiny. Dividing by $$\sqrt{d_k}$$ keeps the scores at roughly unit variance regardless of $$d_k$$.

## The argument

Assume each component of $$q$$ and $$k$$ is independent with mean 0 and variance 1 (roughly true at initialisation). Then

$$q\cdot k=\sum_{i=1}^{d_k} q_i k_i$$

- Each term $$q_i k_i$$ has mean 0 and variance 1.
- The terms are independent, so variances add: $$\text{Var}(q\cdot k)=d_k$$.
- The standard deviation is therefore $$\sqrt{d_k}$$.

Dividing by $$\sqrt{d_k}$$ gives variance 1 again:

$$\text{Var}\!\left(\frac{q\cdot k}{\sqrt{d_k}}\right)=\frac{d_k}{d_k}=1$$

A quick simulation agrees: the standard deviation of $$q\cdot k$$ is about 4 for $$d_k=16$$, 8 for 64, 16 for 256 and 32 for 1024.

## Why large scores hurt

For softmax output $$p$$, the Jacobian is $$\text{diag}(p)-pp^\top$$. When one entry of $$p$$ is close to 1, this matrix is close to zero, so almost no gradient flows back to the queries and keys and learning stalls. In a random example with $$d_k=1024$$ and 8 keys, the largest softmax weight is about 1.00 without scaling and about 0.35 with it.

## Why $$\sqrt{d_k}$$ and not $$d_k$$?

Dividing by $$d_k$$ would shrink the variance to $$1/d_k$$, making the scores nearly equal and the attention almost uniform. $$\sqrt{d_k}$$ is exactly the factor that restores unit variance under the assumption above.

## Caveats

- The independence and unit-variance assumption holds best at initialisation. During training the distributions drift, and some recent models add **QK-norm** (normalising $$Q$$ and $$K$$) to control logit growth.
- Scaling controls the *typical* magnitude; it does not prevent individual large scores.

## Interview follow-up

*"What happens if you forget the scaling?"* Training usually still runs, but it is less stable, especially at large head dimensions, because attention distributions become sharp too early.
