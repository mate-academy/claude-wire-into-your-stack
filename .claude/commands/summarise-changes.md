---
description: Summarise what changed on the current branch vs main (or a given base ref)
argument-hint: "[base-ref, default: main]"
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git branch:*)
---

## Context

- Current branch: !`git branch --show-current`
- Working tree status: !`git status --short`
- Commits on this branch not in main: !`git log --oneline main..HEAD`
- Files changed vs main (committed): !`git diff --stat main...HEAD`
- Uncommitted changes: !`git diff --stat HEAD`

## Task

Summarise what changed. Base ref: `$ARGUMENTS` — if that is empty, use `main` (the context
above already uses `main`; if a different base was given, re-run those git commands against it).
Read the full diffs (`git diff <base>...HEAD` and `git diff HEAD`) where you need detail.

Format the summary as:

1. **One-line overview** — what this set of changes does, in plain words.
2. **Changes by area** — group by area of the codebase (e.g. `routes/`, `db/store.js`,
   `server.js`, tests, config/tooling). For each, a short bullet on *what* changed and *why*
   it matters.
3. **Uncommitted work** — anything in the working tree not yet committed (omit if none).
4. **Things to check** — risks worth a second look: changed API behaviour or status codes,
   error shapes that don't match `{ "error": "message" }`, routes holding state instead of
   going through `db/store.js`, missing tests. Omit if nothing stands out.

Keep it concise — no file-by-file dumps, no restating the diff line by line.
