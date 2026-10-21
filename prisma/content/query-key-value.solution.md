## Short answer

Each token produces three vectors from learned linear projections of its representation $$x$$:

- **Query** $$q = xW_Q$$: what this token is looking for.
- **Key** $$k = xW_K$$: what this token offers to be matched against.
- **Value** $$v = xW_V$$: the information this token passes on if it is selected.

A token's output is a weighted sum of all value vectors, where the weights come from how well its query matches each key:

$$\text{Attention}(Q,K,V)=\text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V$$

## Retrieval analogy

Think of a soft dictionary lookup. A normal dictionary returns the value whose key equals the query exactly. Attention compares the query with *every* key, turns the similarities into weights with softmax, and returns a blend of all the values.

## Shapes

For a sequence of $$T$$ tokens with model width $$d$$:

| Tensor | Shape |
|---|---|
| Input $$X$$ | $$[T, d]$$ |
| $$W_Q,\ W_K$$ | $$[d, d_k]$$ |
| $$W_V$$ | $$[d, d_v]$$ |
| $$Q,\ K$$ | $$[T, d_k]$$ |
| $$V$$ | $$[T, d_v]$$ |
| Scores $$QK^\top$$ | $$[T, T]$$ |
| Output | $$[T, d_v]$$ |

## Why three different projections?

- Separating **keys** from **values** lets the model learn *what to match on* independently of *what to pass along*.
- Separate $$W_Q$$ and $$W_K$$ make matching asymmetric: token A can attend to B without B attending to A in the same way.
- Using $$x$$ directly for all three would force every token to match on exactly the features it passes on, and the score matrix $$XX^\top$$ would be symmetric.

## In practice

- In self-attention all three come from the same sequence. In **cross-attention**, $$Q$$ comes from the decoder and $$K,V$$ from the encoder.
- During generation the **KV cache** stores $$K$$ and $$V$$ for past tokens, not $$Q$$, because only the newest token's query is needed.

## Interview follow-up

*"What do the attention weights mean?"* Row $$i$$ of the softmaxed score matrix is a probability distribution over the positions that token $$i$$ reads from. It is a useful signal but not a complete explanation of the model's behaviour.
