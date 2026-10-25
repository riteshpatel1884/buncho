**MLOps:** practices for training, deploying and monitoring ML models: data pipelines, experiment tracking, model registry, CI/CD for models, feature stores, drift monitoring.

**LLMOps:** the same discipline adapted to applications built on **large pretrained models** (often via API), where most of the work is prompts, retrieval, tools, evaluation and cost control rather than training from scratch.

| Aspect | Traditional MLOps | LLMOps |
|---|---|---|
| Main artefact | Trained model + features | **Prompts, RAG pipeline, tools, agents, adapters**, plus a (usually third-party) model |
| Development | Train/tune on your data | Prompt engineering, RAG, fine-tuning/LoRA when needed |
| Data | Labelled datasets, features | Documents, embeddings/vector stores, examples, feedback |
| Evaluation | Accuracy, F1, AUC on test sets | **Open-ended outputs**: LLM-as-judge, human review, faithfulness, safety, task success |
| Versioning | Model, data, code | Prompts, model versions, retrieval indexes, tool schemas, configs |
| Deployment | Model server | Gateway, routing, caching, guardrails, streaming, fallbacks |
| Monitoring | Data/prediction drift, accuracy | **Traces**, token cost, latency, hallucination/safety rates, user feedback, provider changes |
| Cost | Training + serving compute | **Per-token usage**, context length, model choice; cost is per request |
| Risks | Bias, drift | Hallucination, prompt injection, data leakage, jailbreaks, non-determinism, provider deprecations |
| Feedback loop | Retrain | Update prompts/retrieval/evals, collect preference data, fine-tune |

**Shared foundations:** versioning, CI/CD, reproducibility, monitoring, governance. **New in LLMOps:** prompt management, evaluation of generative output, guardrails, orchestration/agent tracing, vector database operations, token economics and provider/model lifecycle management.

**Practical takeaway:** treat prompts and retrieval as code, build an evaluation harness first, trace every step, and manage cost and model upgrades as ongoing operational concerns.
