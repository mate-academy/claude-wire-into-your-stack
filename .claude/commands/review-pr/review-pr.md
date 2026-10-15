---
description: Review a pull request for a specific set of concerns
argument-hint: [pr-number] [focus-area]
allowed-tools: Bash(gh pr view:*), Bash(gh pr diff:*)
---

Review PR #$1, focusing specifically on $2.

Steps:
1. Run `gh pr view $1` to get context
2. Run `gh pr diff $1` to see the changes
3. Flag any issues related to $2 specifically
4. Note anything else concerning even if outside that focus area