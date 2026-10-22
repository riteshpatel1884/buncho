## Definition

**Generative AI** refers to models that learn the **distribution of data** and use it to **produce new content** (text, images, audio, video, code, molecules) that resembles the training data but is not a copy of it.

## Generative vs discriminative

| | Discriminative | Generative |
|---|---|---|
| Learns | $P(y\mid x)$, a boundary between classes | $P(x)$ or $P(x\mid c)$, how the data itself is produced |
| Output | Label, score, number | New sample |
| Examples | Spam classifier, image classifier | LLM, image generator |

A generative model can be conditioned on a prompt $c$ (text, image, class) to control what it produces.

## Main model families

1. **Autoregressive models** (GPT-style LLMs): generate one token at a time, $P(x)=\prod_t P(x_t\mid x_{<t})$. Dominant for text and code, also used for audio and some image models.
2. **Diffusion models** (Stable Diffusion, Flux, DALL-E, video models): learn to **denoise** gradually from random noise to a sample. Dominant for images, audio and video.
3. **GANs:** a generator and a discriminator train against each other. Fast sampling, but unstable training; less common now.
4. **VAEs:** encode to a latent space and decode back; often used as the **latent compressor** inside diffusion pipelines.
5. **Normalising flows and others:** exact likelihoods, more niche.

## What made it practical

Transformers, large-scale self-supervised pre-training, abundant compute, and alignment techniques (instruction tuning, RLHF) that turn raw models into useful assistants.

## Applications

Chat assistants, coding assistants, summarisation, search and RAG, content and image creation, translation, synthetic data, voice agents, drug and materials design.

## Limitations and risks

- **Hallucination:** fluent but false output, because the objective rewards plausibility.
- **Bias and toxicity** inherited from training data.
- **Copyright, privacy and memorisation** of training data.
- **Misuse:** deepfakes, spam, fraud, prompt injection in agentic systems.
- **Cost and energy** of training and serving.
- **Evaluation difficulty:** open-ended outputs have no single correct answer.

## Engineering view

Building with generative AI means controlling it (prompting, RAG, fine-tuning), evaluating it (golden sets, LLM-as-a-judge), guarding it (safety filters) and serving it efficiently.
