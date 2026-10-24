```python
import hashlib, json, sqlite3, threading, time

class LLMCache:
    def __init__(self, path="llm_cache.db", ttl=24 * 3600):
        self.db = sqlite3.connect(path, check_same_thread=False)
        self.db.execute("CREATE TABLE IF NOT EXISTS c (k TEXT PRIMARY KEY, v TEXT, ts REAL)")
        self.ttl, self.lock, self.inflight = ttl, threading.Lock(), {}

    @staticmethod
    def key(model, messages, **params):
        payload = json.dumps({"m": model, "msgs": messages, "p": params}, sort_keys=True)
        return hashlib.sha256(payload.encode()).hexdigest()

    def get(self, k):
        row = self.db.execute("SELECT v, ts FROM c WHERE k=?", (k,)).fetchone()
        if row and time.time() - row[1] < self.ttl:
            return json.loads(row[0])
        return None

    def set(self, k, value):
        self.db.execute("INSERT OR REPLACE INTO c VALUES (?,?,?)", (k, json.dumps(value), time.time()))
        self.db.commit()

    def call(self, llm, model, messages, **params):
        if params.get("temperature", 1) > 0:          # only cache deterministic calls
            return llm(model, messages, **params)
        k = self.key(model, messages, **params)
        hit = self.get(k)
        if hit is not None:
            return hit
        with self.lock:                               # single-flight: one request per key
            ev = self.inflight.get(k)
            leader = ev is None
            if leader:
                ev = self.inflight[k] = threading.Event()
        if not leader:
            ev.wait()
            return self.get(k) or llm(model, messages, **params)
        try:
            value = llm(model, messages, **params)
            self.set(k, value)
            return value
        finally:
            with self.lock:
                self.inflight.pop(k, None)
            ev.set()
```

**Key must include:** model name and version, full messages, system prompt, temperature, max tokens, tools, response format, and **prompt template version**. Leaving any out returns wrong cached answers.

**Rules**

- Cache only **deterministic** calls (temperature 0) or where variety is not needed.
- **Never share** across users when the prompt contains private data (include user/tenant in the key or skip caching).
- Choose **TTL** by data freshness; invalidate on prompt/model changes (they change the key anyway).
- Do not cache errors or refusals.
- **Single-flight** prevents a stampede of identical concurrent calls.
- Track hit rate and savings. Also use **provider prompt caching** for long shared prefixes; it is complementary.
