**Requirements.** One stable API that hides provider differences; safe defaults (timeouts, retries); visibility into cost and latency; easy to test offline; async-first with a sync wrapper; no lock-in.

**1. API and abstraction**
- Provider-neutral data types (Pydantic or frozen dataclasses): `Message(role, content)`, `ChatRequest(model, messages, temperature, max_tokens, tools, response_schema)`, `ChatResponse(text, tool_calls, usage, latency, raw)`.
- An abstract `Provider` (ABC or `Protocol`) with `async complete(req)` and `stream(req)`. Adapters (`OpenAIProvider`, `AnthropicProvider`, `LocalVLLMProvider`) translate to and from each SDK and normalise errors into your own hierarchy: `RateLimitError`, `TimeoutError`, `InvalidRequestError`, `ContentFilterError`.
- A registry or factory by model alias (`"fast"`, `"smart"`), so services ask for a capability and config maps it to a provider and model. Changing models is then a config change.

**2. Reliability**
- Per-call timeout and an overall deadline; retries with exponential backoff and jitter only for transient errors; honour `Retry-After`.
- Client-side **rate limiter** (token bucket on requests and tokens per minute) plus a concurrency semaphore. Circuit breaker for a failing provider and **fallback chain** (provider B or a smaller model), recording that a fallback occurred.
- Idempotency considerations for tool calls with side effects.

**3. Observability and cost**
- Middleware pipeline (decorator or interceptor chain): logging, tracing (OpenTelemetry spans), metrics (latency, tokens, error class, retries, cache hit) tagged by service, feature, model and prompt version.
- Token and cost accounting from `usage`; per-service budgets and alerts; redact secrets and PII in logs; sampling for prompt/response capture.

**4. Caching, structured output, testing**
- Optional cache keyed on a hash of (model, messages, params), only for deterministic settings; TTL and version in the key; never cache user-private data across tenants.
- `complete_structured(req, Model)` with schema validation and a bounded repair loop (see the JSON validation question).
- `FakeProvider` and recorded-response fixtures for unit tests; contract tests that run every adapter against the same suite; no network in CI by default.

**5. Packaging and rollout**
- Async core with `asyncio`; a sync facade using `asyncio.run` or a background loop for scripts. Typed (`py.typed`), semantic versioning, changelog, minimal dependencies, provider SDKs as optional extras.
- Config via environment/settings objects; secrets from a secret manager, not code.
- Rollout: migrate one low-risk service, compare cost/latency against the old path, then migrate the rest; keep an escape hatch (`raw` response, passthrough params) so teams are not blocked.

**Trade-offs to state.** A lowest-common-denominator API hides provider-specific features; offer an `extra` passthrough. A thick abstraction can lag provider releases, so keep adapters thin. Centralising policy (limits, logging) in a library means every service must upgrade; a gateway service gives central control at the cost of an extra network hop and operational burden.
