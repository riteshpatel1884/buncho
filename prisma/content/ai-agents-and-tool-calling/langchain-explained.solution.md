**What it is:** an open-source framework of building blocks for LLM applications: model wrappers, prompt templates, output parsers, retrievers, vector store integrations, tools and agents, with hundreds of integrations.

**Core abstractions**

| Abstraction | Purpose |
|---|---|
| **Chat models / LLMs** | Unified interface to providers (OpenAI, Anthropic, Google, local models) |
| **Prompt templates** | Reusable parameterised prompts and message lists |
| **Output parsers / structured output** | Turn model text into typed objects (Pydantic) |
| **Document loaders, text splitters** | Ingest and chunk data |
| **Embeddings and vector stores** | Index and similarity search |
| **Retrievers** | Interface returning relevant documents |
| **Tools** | Functions the model can call; bind schemas to models |
| **Agents** | Model + tools loop (modern agents are built on LangGraph) |
| **Memory / message history** | Conversation state handling |
| **Callbacks / tracing** | Logging and observability (LangSmith) |

**Composition with LCEL (LangChain Expression Language):** components are **Runnables** that share `invoke`, `batch`, `stream` and async methods and are chained with `|`.

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_anthropic import ChatAnthropic

prompt = ChatPromptTemplate.from_template("Summarise in 2 sentences:\n{text}")
chain = prompt | ChatAnthropic(model="claude-sonnet-5-5") | StrOutputParser()
print(chain.invoke({"text": article}))
```

A RAG chain is `retriever | format_docs | prompt | model | parser`.

**Pros:** fast prototyping, many integrations, consistent interfaces, streaming and batching built in, tracing and evaluation ecosystem.

**Cons:** abstraction overhead and layers that can hide what is sent to the model, rapid API changes, harder debugging for simple tasks, and some components are heavier than needed.

**Guidance:** use LangChain for integrations and rapid prototypes, use **LangGraph** for stateful, multi-step or agentic workflows, and call provider SDKs directly when the app is simple or you need full control.
