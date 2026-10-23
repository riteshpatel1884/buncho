**Idea:** train the LLM itself to **retrieve on demand and critique its own output** by generating special **reflection tokens** inline with its text.

**Reflection tokens**

| Token | Meaning |
|---|---|
| `Retrieve` | Should I fetch documents for this segment? (yes / no / continue) |
| `IsRel` | Is the retrieved passage relevant to the query? |
| `IsSup` | Is my generated segment supported by the passage? (fully / partially / not) |
| `IsUse` | Is the overall response useful? (1 to 5) |

**Inference loop**

1. While generating, the model predicts `Retrieve`. If no, it continues without retrieval (cheap for simple questions).
2. If yes, retrieve several passages and generate **one candidate continuation per passage in parallel**.
3. Each candidate gets `IsRel`, `IsSup` and `IsUse` scores; irrelevant or unsupported candidates are dropped.
4. Choose the best segment by a weighted score of the critique tokens (weights tunable at inference, for example favour support over fluency) and repeat.

**Training:** a critic model (GPT-4-labelled data) annotates a corpus with reflection tokens; the generator is then trained on text with these tokens inserted.

**Compared with others**

- **Standard RAG:** always retrieves once, never critiques.
- **Agentic RAG:** a separate prompted agent plans and calls tools; works with any model but relies on prompting.
- **Self-RAG:** retrieval decisions and critiques are **learned inside the model**, giving controllable behaviour at inference and improved factuality and citations in the paper's benchmarks.

**Limits:** needs a specially trained model (fine-tuning cost), parallel candidates raise compute, and critique quality bounds the benefit. Many production systems approximate it with prompted graders and routing.
