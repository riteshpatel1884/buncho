```python
import ast, json, operator as op

# ---- Safe calculator: whitelist AST nodes instead of eval() ----
OPS = {ast.Add: op.add, ast.Sub: op.sub, ast.Mult: op.mul, ast.Div: op.truediv,
       ast.Pow: op.pow, ast.USub: op.neg, ast.Mod: op.mod}

def calculator(expr: str) -> str:
    def ev(n):
        if isinstance(n, ast.Constant) and isinstance(n.value, (int, float)):
            return n.value
        if isinstance(n, ast.BinOp) and type(n.op) in OPS:
            return OPS[type(n.op)](ev(n.left), ev(n.right))
        if isinstance(n, ast.UnaryOp) and type(n.op) in OPS:
            return OPS[type(n.op)](ev(n.operand))
        raise ValueError("unsupported expression")
    return str(ev(ast.parse(expr, mode="eval").body))

def web_search(query: str) -> str:
    # plug in Tavily / SerpAPI / Bing here; return short text snippets
    return "snippet 1...; snippet 2..."

TOOLS = {"calculator": calculator, "web_search": web_search}

SYSTEM = '''Answer the question. You may use tools. On each turn reply with ONE JSON object:
{"thought": "...", "action": "calculator|web_search", "input": "..."}
or, when finished: {"thought": "...", "final_answer": "..."}
Tools: calculator(expression), web_search(query).'''

def react(question, llm, max_steps=6):
    msgs = [{"role": "system", "content": SYSTEM}, {"role": "user", "content": question}]
    for _ in range(max_steps):
        raw = llm(msgs)
        msgs.append({"role": "assistant", "content": raw})
        try:
            step = json.loads(raw)
        except json.JSONDecodeError:
            msgs.append({"role": "user", "content": "Observation: reply must be valid JSON."})
            continue
        if "final_answer" in step:
            return step["final_answer"]
        tool = TOOLS.get(step.get("action"))
        try:
            obs = tool(step["input"]) if tool else "unknown tool"
        except Exception as e:
            obs = f"error: {e}"
        msgs.append({"role": "user", "content": f"Observation: {obs}"})
    return "No answer within step limit."
```

**Check:** `calculator("2*(3+4)**2")` returns `98`; `calculator("__import__('os')")` raises, so the model cannot run arbitrary code.

**Notes:** in production use the provider's native **function calling** instead of free-form JSON (more reliable), keep a step/cost budget, truncate observations, and cite which search results were used. This is the **ReAct** pattern: reason, act, observe, repeat.
