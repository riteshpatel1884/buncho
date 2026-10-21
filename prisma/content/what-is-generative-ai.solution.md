## Short answer

**Generative AI** refers to models that learn the distribution of data and use it to **produce new content** (text, code, images, audio, video, molecules) rather than only labelling or scoring existing inputs.

## Generative vs. discriminative

| | Discriminative | Generative |
|---|---|---|
| Learns | $$p(y \mid x)$$: the label given the input | $$p(x)$$ or $$p(x \mid c)$$: the data itself, optionally given a condition $$c$$ such as a prompt |
| Output | A class, score or number | New samples |
| Example | Spam classifier | Chat model, image generator |

## Main model families

| Family | Idea | Typical use |
|---|---|---|
| **Autoregressive** (LLMs) | Predict the next token repeatedly | Text, code, increasingly multimodal |
| **Diffusion** | Learn to remove noise step by step; generate by denoising from random noise | Images, video, audio |
| **GANs** | Generator and discriminator trained against each other | Image synthesis (less common for new systems) |
| **VAEs** | Encode to a latent space and decode samples from it | Latent representations, components of other systems |

## How it is used in products

Prompting, retrieval-augmented generation, tool use and agents, and fine-tuning, all wrapped in evaluation and guardrails.

## Limitations

- **Hallucination:** fluent output that is not grounded in fact.
- **Bias and safety:** models reproduce patterns in their training data.
- **Cost and latency:** large models and long outputs are expensive.
- **Non-determinism:** the same input can give different outputs, which complicates testing.
- **Legal and IP questions:** training data, copyright and privacy are active areas of regulation.

## Interview follow-up

*"Is every use of an LLM generative AI?"* Using an LLM to classify a ticket is generative *technology* applied to a discriminative *task*. The distinction is about what the model learned to do, not what the product needs.
