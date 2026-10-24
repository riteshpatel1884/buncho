**From scratch: dict + doubly linked list**

```python
import time

class Node:
    __slots__ = ("key", "val", "exp", "prev", "next")
    def __init__(self, key=None, val=None, exp=None):
        self.key, self.val, self.exp = key, val, exp
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity, default_ttl=None, clock=time.monotonic):
        self.cap, self.ttl, self.clock = capacity, default_ttl, clock
        self.map = {}
        self.head, self.tail = Node(), Node()               # sentinels: head <-> ... <-> tail
        self.head.next, self.tail.prev = self.tail, self.head

    def _remove(self, n):
        n.prev.next, n.next.prev = n.next, n.prev

    def _push_front(self, n):                               # most recently used next to head
        n.next, n.prev = self.head.next, self.head
        self.head.next.prev = n
        self.head.next = n

    def get(self, key, default=None):
        n = self.map.get(key)
        if n is None:
            return default
        if n.exp is not None and self.clock() >= n.exp:     # expired: treat as a miss and drop it
            self._remove(n); del self.map[key]
            return default
        self._remove(n); self._push_front(n)                # mark as recently used
        return n.val

    def put(self, key, val, ttl=None):
        ttl = self.ttl if ttl is None else ttl
        exp = self.clock() + ttl if ttl is not None else None
        n = self.map.get(key)
        if n:
            n.val, n.exp = val, exp
            self._remove(n); self._push_front(n)
            return
        if len(self.map) >= self.cap:
            self._evict()
        n = Node(key, val, exp)
        self.map[key] = n
        self._push_front(n)

    def _evict(self):
        now = self.clock()
        lru = self.tail.prev
        if lru is self.head:
            return
        self._remove(lru); del self.map[lru.key]            # evict the least recently used

# Test with a fake clock
t = [0.0]
c = LRUCache(2, default_ttl=10, clock=lambda: t[0])
c.put("a", 1); c.put("b", 2); c.get("a"); c.put("c", 3)     # evicts "b"
assert c.get("b") is None and c.get("a") == 1
t[0] = 11
assert c.get("a") is None                                   # TTL expired
```

**Same thing with `OrderedDict` (what you would write in practice)**

```python
from collections import OrderedDict
class LRU:
    def __init__(self, cap): self.cap, self.d = cap, OrderedDict()
    def get(self, k):
        if k not in self.d: return None
        self.d.move_to_end(k); return self.d[k]
    def put(self, k, v):
        self.d[k] = v; self.d.move_to_end(k)
        if len(self.d) > self.cap: self.d.popitem(last=False)
```

**Complexity:** hash lookup finds the node in $O(1)$; the linked list moves/removes it in $O(1)$.

**TTL details:** use a **monotonic clock** (not wall time); expire **lazily** on access, optionally also **sweep** with a periodic job or evict expired entries first, otherwise dead entries occupy space; inject the clock so tests are deterministic. For threads wrap operations in a lock. Python's `functools.lru_cache` is a built-in LRU for pure functions but has no TTL.
