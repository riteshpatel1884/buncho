**SWE-bench:** each task is a real GitHub issue from a Python repo; the agent must produce a patch; success = the repository's **FAIL_TO_PASS tests now pass and PASS_TO_PASS tests still pass**. **SWE-bench Verified** is a human-validated 500-task subset.

**Why pass rates can mislead**

- **Weak or incomplete tests:** a patch can pass the tests yet be wrong, incomplete or not what the maintainer would merge (studies of "plausible" patches found a meaningful share semantically incorrect).
- **Under-specified or flawed tasks:** ambiguous issues, tests that require hidden implementation details; some instances are broken.
- **Contamination/memorisation:** public repos and issues are in training data; models may recall upstream fixes.
- **Leakage in the environment:** agents may find solutions via git history, future commits, or issue comments.
- **Scaffold and compute dependence:** results depend on the harness (tools, prompts, retries, number of attempts, test-time search, verifier, parallel samples), not just the model; headline numbers often use best-of-N or expensive setups. **Cost and time per task** are rarely reported.
- **Narrow distribution:** mostly small, well-tested Python libraries; not representative of private, multi-language, large or poorly tested codebases or tasks beyond bug fixing (features, refactors, migrations).
- **Saturation and variance:** single-run scores are noisy; small differences are not significant.
- **No quality dimensions:** style, maintainability, security, minimal diffs, regressions outside tests, and review effort are ignored.

**A better evaluation**

1. **Task suite from your own repos:** real issues/PRs with executable tests, **held out** from anything the agent saw; include different task types and difficulty; refresh regularly.
2. **Multiple metrics:** resolve rate (with repeated runs and confidence intervals), **patch quality** (human or LLM review against the reference diff, linters, security scans), regression rate (full test suite, not just targeted tests), diff size, **cost, tokens, steps and wall-clock time**, escalation/ask-for-help behaviour.
3. **Independent verification:** hidden tests written by someone other than the patch author; mutation testing or property tests to detect overfitting to visible tests.
4. **Safety and reliability:** destructive actions, secret leakage, sandbox escapes, behaviour under prompt injection in repo content.
5. **Online/offline pairing:** developer acceptance rate of PRs, review comments, revert rate, time saved.
6. **Ablate the scaffold** (model, tools, context strategy) to know what drives improvements.

**Report** pass@1 under fixed budget, plus cost per resolved task and failure-mode analysis.
