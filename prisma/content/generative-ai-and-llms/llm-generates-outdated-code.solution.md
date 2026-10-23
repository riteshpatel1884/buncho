**Root cause:** the weights reflect training data up to a cutoff, and older code is far more common online than new code, so old patterns dominate.

**Fixes**

1. **Tell it the versions:** put `pyproject`/`package.json` dependencies and language version in the prompt: "Use pandas 2.x and Python 3.12; do not use deprecated APIs."
2. **Retrieve current docs (RAG):** index official docs, changelogs and migration guides for your versions; inject the relevant snippets.
3. **Tool use:** let the model search docs, read installed package source, or run `pip show` / `--help`.
4. **Verify automatically:** run linters, type checkers and tests; surface `DeprecationWarning` (`python -W error`) and feed errors back for a fix loop.
5. **Project rules file:** keep a short "preferred APIs / banned APIs" list.
6. **Fine-tune or continue pre-training** on recent code only if the above is not enough (costly and goes stale again).

```python
for attempt in range(3):
    code = llm(prompt + feedback)
    result = run_tests_with_warnings_as_errors(code)   # sandboxed
    if result.ok:
        break
    feedback = f"\nFix these errors:\n{result.stderr}"
```

**Principle:** treat the model as a strong reasoner with stale memory, and supply fresh facts and a feedback loop.
