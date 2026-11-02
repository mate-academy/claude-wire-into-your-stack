---
description: Draft a pull request description for the current branch
argument-hint: <optional extra focus>
allowed-tools: Bash(git status), Bash(git diff:*), Bash(git log:*)
---

Draft a pull request description for this branch compared to main. Include both committed and uncommitted changes (use git status, git log, and git diff).

Format it as:
- A one-line summary
- What changed and why (short bullets)
- How to test it

Keep it short and plain. Extra focus, if any: $ARGUMENTS