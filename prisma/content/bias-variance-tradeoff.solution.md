## The idea

For squared error, the expected prediction error at a point can be decomposed as:

$$
\mathbb{E}\big[(y - \hat f(x))^2\big] = \underbrace{\text{Bias}[\hat f(x)]^2}_{\text{wrong assumptions}} + \underbrace{\text{Var}[\hat f(x)]}_{\text{sensitivity to the training sample}} + \underbrace{\sigma^2}_{\text{irreducible noise}}
$$

- **Bias** is error from a model that is too simple to capture the true pattern (underfitting).
- **Variance** is how much the learned function changes if you train on a different sample (overfitting).
- **Noise** cannot be removed by any model.

Making a model more flexible usually lowers bias and raises variance, so you look for the level of complexity that minimises total error on unseen data.

## Reading learning curves

| Symptom | Training error | Validation error | Diagnosis |
|---|---|---|---|
| Both high, close together | High | High | High bias |
| Large gap | Low | High | High variance |

## Fixing high variance (the case in the question)

1. Get more (or more diverse) training data.
2. Add regularisation: L2/L1, dropout, early stopping, weight decay.
3. Reduce model capacity or the number of features.
4. Use ensembling such as bagging or random forests.
5. Use data augmentation where appropriate.

## Fixing high bias

Use a more expressive model, add informative features, train longer, or reduce regularisation.

## Good caveats to mention

- The clean decomposition is exact for squared loss; for other losses it is only an intuition.
- Very large neural networks can show *double descent*, where test error falls again past the interpolation point, so "more capacity always means more variance" is too simple.
- Always compare against a validation or cross-validation estimate, never the training error.
