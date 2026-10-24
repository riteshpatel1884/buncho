```python
import hashlib, json, time
from pathlib import Path

class PromptRegistry:
    def __init__(self, root="prompts"):
        self.root = Path(root); self.root.mkdir(exist_ok=True)

    def _path(self, name): return self.root / f"{name}.json"
    def _load(self, name):
        p = self._path(name)
        return json.loads(p.read_text()) if p.exists() else {"versions": [], "labels": {}}

    def publish(self, name, template, notes=""):
        data = self._load(name)
        digest = hashlib.sha256(template.encode()).hexdigest()[:12]
        if data["versions"] and data["versions"][-1]["hash"] == digest:
            return data["versions"][-1]["version"]              # unchanged: no new version
        v = len(data["versions"]) + 1
        data["versions"].append({"version": v, "hash": digest, "template": template,
                                 "notes": notes, "created": time.time()})
        self._path(name).write_text(json.dumps(data, indent=2))
        return v

    def label(self, name, label, version):                       # e.g. "production" -> 3
        data = self._load(name)
        assert any(x["version"] == version for x in data["versions"])
        data["labels"][label] = version
        self._path(name).write_text(json.dumps(data, indent=2))

    def get(self, name, ref="production"):                       # ref = label or int version
        data = self._load(name)
        v = data["labels"][ref] if isinstance(ref, str) else ref
        return next(x for x in data["versions"] if x["version"] == v)

# usage
reg = PromptRegistry()
reg.publish("summarise", "Summarise in 3 bullets:\n{{ text }}")
reg.label("summarise", "production", 1)
p = reg.get("summarise")                       # log p["version"], p["hash"] with every LLM call
```

**Principles**

- **Immutable versions + movable labels:** rollback is just re-pointing `production` to an earlier version.
- **Content hash** detects accidental duplicates and ties logs to exact text.
- **Log the prompt version** (and model, parameters) with each request so regressions can be traced.
- **Test before promoting:** run an evaluation set against the candidate version; promote via A/B or canary.
- Version the **whole config** (template, model, temperature, tools), not only the text.
- At scale use Git plus a prompt-management tool (LangSmith, Langfuse, PromptLayer), but the model stays the same.
