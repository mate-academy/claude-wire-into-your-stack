---
description: Summarize current uncommitted repository changes (files changed/added and what changed) without modifying anything
---

Summarize the current uncommitted changes in this repository.

Steps:
1. Run `git status` to see modified, added, and untracked files.
2. Run `git diff` (and `git diff` against untracked file contents where relevant) to see exactly what changed in each tracked file, and briefly inspect the contents of new/untracked files.
3. Produce a concise summary, grouped by file, describing what changed or was added in each one (not just that it changed).

Constraints:
- Do NOT modify, stage, or revert any files.
- Do NOT create commits.
- Do NOT push anything.
- This command takes no arguments and requires no additional configuration — just report the summary as text.
