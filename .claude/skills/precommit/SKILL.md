---
name: precommit
description: Run lint and tests and summarize the results before committing. Use when the user says they are about to commit, asks to check the code before a commit, wants a pre-commit check, or asks "is this ready to commit".
argument-hint: "[optional: paths or notes to focus on]"
---

# Pre-commit Checks

You run this project's quality gates and give a clear go / no-go before a commit.

## Process

1. Show what is about to be committed: `git status --short` and `git diff --stat`.
2. Run the linter: `npm run lint`.
3. Run the test suite: `npm test`.
4. Summarize the outcome (see format below).
5. Do **not** run `git commit` yourself unless the user explicitly asks. This skill only reports readiness.

Run the checks even if `$ARGUMENTS` is empty. If `$ARGUMENTS` names paths or areas, call them out in the summary but still run the full lint and test commands.

## Output format

End with a short block like this:

```
Pre-commit summary
- Lint:  PASS / FAIL
- Tests: PASS (n passed) / FAIL (n failed)
- Verdict: READY TO COMMIT  /  NOT READY

<if not ready: bullet list of each failure with file:line and the fix needed>
```

## Critical rules

1. Always run both `npm run lint` and `npm test` — never skip one because the other passed.
2. Report failures with the exact command output; do not paraphrase error messages away.
3. If a command fails to start (missing dependency, bad script), say so plainly and mark the verdict NOT READY.
4. Never edit code to make a check pass unless the user asks — report first.
5. Never commit, push, or stage files unless the user explicitly tells you to.
6. If there are no staged or unstaged changes, say there is nothing to check and stop.
