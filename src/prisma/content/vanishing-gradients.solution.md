## Backpropagation in one paragraph

Backprop applies the chain rule layer by layer from the loss backwards. With pre-activations $z^{(l)} = W^{(l)} a^{(l-1)} + b^{(l)}$ and activations $a^{(l)} = \sigma(z^{(l)})$:

$$
\delta^{(l)} = \big(W^{(l+1)\top} \delta^{(l+1)}\big) \odot \sigma'(z^{(l)}), \qquad
\frac{\partial L}{\partial W^{(l)}} = \delta^{(l)} \, a^{(l-1)\top}
$$

## Why gradients vanish

Unrolling the recursion, the gradient reaching an early layer contains a **product** of many factors of the form $W^\top \cdot \sigma'(z)$. If each factor has magnitude below 1, the product shrinks exponentially with depth. For the sigmoid, $\sigma'(z) \le 0.25$, so each layer can shrink the signal by at least 4x. Early layers then learn very slowly or not at all. If the factors are larger than 1, gradients **explode** instead.

The same effect appears across time steps in plain RNNs.

## Mitigations

| Technique | How it helps |
|---|---|
| ReLU / GELU activations | Derivative is 1 (or near it) over the active region, so it does not shrink the signal |
| Careful initialisation (He for ReLU, Xavier/Glorot for tanh) | Keeps activation and gradient variance roughly constant across layers |
| Batch / layer normalisation | Keeps pre-activations in a well-scaled range |
| Residual connections | Add an identity path, so gradients can flow through $+x$ unchanged |
| LSTM / GRU gates | Additive cell-state updates preserve gradient across time |
| Gradient clipping | Handles the exploding case |

## Follow-up you should expect

*Why do residual connections help?* In $y = x + F(x)$, the Jacobian is $I + \partial F / \partial x$, so the identity term gives gradients a direct path to earlier layers.
