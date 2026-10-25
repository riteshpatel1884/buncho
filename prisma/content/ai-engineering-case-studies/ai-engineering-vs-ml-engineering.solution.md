**One-line answer:** ML engineers mostly **build and train models**; AI engineers mostly **build products on top of pretrained foundation models**.

| | **ML Engineering** | **AI Engineering** |
|---|---|---|
| Starting point | Data and a problem; you train the model | A pretrained model (API or open weights); you adapt it |
| Core work | Feature engineering, training, tuning, deployment, MLOps | Prompting, RAG, tool use/agents, fine-tuning (often LoRA), evaluation, guardrails, LLMOps |
| Main iteration loop | Data, features, architecture, hyper-parameters | Prompts, retrieval, context, orchestration, model choice |
| Evaluation | Held-out test set, standard metrics | No single ground truth: LLM-as-judge, human review, task-specific eval sets, regression suites |
| Failure modes | Overfitting, drift, leakage, imbalance | Hallucination, prompt injection, inconsistent output, cost and latency blow-ups |
| Skills | Statistics, ML theory, PyTorch/sklearn, data pipelines | Software engineering, APIs, async/streaming, vector DBs, prompt design, product sense |
| Cost profile | Training compute dominates | Inference cost and latency dominate |
| Output | A model | A **system**: model + data + retrieval + tools + guardrails + monitoring |

**Overlap:** both need data quality, evaluation discipline, deployment and monitoring, and an understanding of model limits. In practice one person often does both: fine-tuning, embeddings and classic ML components (rankers, classifiers) sit inside AI products.

**Why the distinction emerged:** foundation models made "good enough" models available through an API, so the bottleneck shifted from training to **building reliable applications**. The AI engineer's value is turning a probabilistic model into a dependable product.

**Interview tip:** end with how you work: "I start by defining the eval set and success metric, use the simplest approach that meets it (prompting, then RAG, then fine-tuning), and measure cost, latency and failure modes before shipping."
