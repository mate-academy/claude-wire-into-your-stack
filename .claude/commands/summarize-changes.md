---
description: Summarize what changed on this branch, for a commit message or PR description
argument-hint: [base-branch]
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*)
---

Summarize the changes on the current branch, compared against `${1:-main}`.

Run `git status`, `git diff ${1:-main}...HEAD`, and `git log ${1:-main}..HEAD` to see the full
set of changes — not just the latest commit.

Then write a short summary aimed at someone reviewing this branch:

- What changed, grouped by concern (e.g. a route added, a hook wired in, docs updated) — not a
  file-by-file listing.
- Why, where the intent isn't obvious from the diff alone.
- Anything that looks incomplete or worth flagging before this ships (missing tests, docs not
  updated for a route change, etc.) per this project's conventions in CLAUDE.md.

Keep it to a few sentences per group. This is a read-only summary — do not modify any files.
