| | Tool-calling agent | Code-generating (code-as-action) agent |
|---|---|---|
| **Action format** | JSON call to a predefined function | A program (Python, shell) executed in a runtime |
| **Action space** | Fixed set of tools | Anything the runtime and libraries allow |
| **Composition** | One call per step (or parallel calls); loops need many LLM turns | Loops, conditionals, variables and function composition inside **one** action |
| **Intermediate data** | Passes through the model's context | Stays in program variables (not in the context) |
| **Safety** | Easier: validate arguments, limited capabilities | Harder: needs **sandboxing**, resource limits, network controls |
| **Reliability** | Predictable, easy to audit | Flexible but can produce bugs and unexpected side effects |
| **Typical use** | Business workflows, APIs, CRUD, support agents | Data analysis, coding, scientific work, tasks needing computation and many steps |

**Example: "find the average of column X for rows where Y > 10, per region"**

```python
# tool-calling: needs a rich tool (or many calls and data in context)
call("query_table", {"sql": "SELECT region, AVG(x) FROM t WHERE y > 10 GROUP BY region"})

# code agent: writes it once and processes the data outside the context
code = '''
import pandas as pd
df = pd.read_csv("t.csv")
print(df[df.y > 10].groupby("region").x.mean())
'''
result = sandbox.run(code)
```

**Why code actions can be stronger:** the model's training on code, natural composition (loops, error handling), fewer LLM round trips and tokens, and the ability to use libraries. Research on "CodeAct" and smolagents-style agents reports fewer steps and higher success on complex tasks.

**Why tool calling is often preferred in production:** tighter control, auditability, permissions per tool, deterministic behaviour, simpler security.

**Hybrid:** expose tools **as functions inside a sandboxed code environment** (the agent writes code that calls vetted APIs), combining flexibility with enforcement of what can be done.
