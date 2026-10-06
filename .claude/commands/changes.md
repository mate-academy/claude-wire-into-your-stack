---
description: Summarize what has changed in the repo
argument-hint: [base-branch-or-commit]
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*)
---

## Context
- Current branch: !`git branch --show-current`
- Status: !`git status --short`
- Recent commits: !`git log --oneline -10`
- Diff stats vs ${ARGUMENTS:-HEAD}: !`git diff --stat ${ARGUMENTS:-HEAD}`

## Task
Summarize what has changed, using the context above.
If a base was given ($ARGUMENTS), compare against it; otherwise cover uncommitted changes.
Run `git diff` on specific files if you need detail.

Output:
1. One-sentence overview
2. Changes grouped by area or feature (bullets, with file paths)
3. Anything risky or worth reviewing (deleted code, config changes, missing tests)

Keep it under 20 lines.
