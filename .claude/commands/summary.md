---
description: Summarise what changed in a given target using a set number of sentences
argument-hint: <target> <sentence-count>
---

Summarise what changed in `$1` using `$2` sentences.

- `$1` is the target: a file path, directory, commit ref, branch, or PR number. Inspect its changes with the appropriate tool (`git diff`, `git log -p`, `git show`, `gh pr diff`, etc.).
- `$2` is the exact number of sentences the summary must be — no more, no fewer.
- Describe what actually changed and why it matters. Do not list every line; focus on the meaningful differences.
- If `$1` is empty, summarise the current uncommitted changes (`git diff HEAD`). If `$2` is empty, default to 3 sentences.
