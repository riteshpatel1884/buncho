| | **Offline evaluation** | **Online evaluation** |
|---|---|---|
| Data | Fixed datasets: golden sets, benchmarks, replayed traffic | Live traffic and real users |
| When | Before release, in CI, during development | After/while deploying (canary, A/B, monitoring) |
| Metrics | Accuracy, F1, faithfulness, judge scores, pass rate, safety suites, latency in test | Task success, CSAT, thumbs, acceptance/edit rate, retention, conversion, complaints, cost, latency in production |
| Speed and cost | Fast, cheap, repeatable, safe | Slower (needs traffic and time), risk to users |
| Strengths | Controlled comparisons, regression gates, fast iteration, tests rare/adversarial cases | Measures **true user value**, captures real distribution, drift and unforeseen behaviour |
| Weaknesses | Dataset may not match reality; can be overfit or stale; proxy metrics | Noisy, confounded, delayed outcomes, ethical/risk constraints, few experiments possible |

**Online methods:** shadow mode (run the new system silently on live requests and compare), canary releases, **A/B tests**, interleaving, bandits, sampled production evaluation by LLM-judges/humans, user feedback and implicit signals.

**How they fit together**

```text
Idea -> offline evals (fast filter) -> shadow/canary -> A/B test -> full rollout
          ^                                                  |
          '------ failures and drift become new offline test cases <---- monitoring
```

- Offline results should **predict** online ones; periodically check the correlation and recalibrate when they diverge (benchmarks up, users unhappy).
- Use offline for **safety and regression gates**; use online for **final decisions** about value and long-term effects (retention, trust).
- Log enough data (inputs, versions, outputs, feedback) so online traffic can be replayed offline.

**Rule:** offline to decide whether a change is safe enough to try, online to decide whether it is actually better.
