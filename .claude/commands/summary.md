---
description: Summarize what changed on this branch vs main, ready to paste into a PR description
---

Run `git diff main...HEAD` and `git log main..HEAD --oneline` yourself (via Bash) to see
every commit and change on the current branch since it diverged from `main`. Extra
context from the user, if any: $ARGUMENTS

Then write a concise PR-ready summary with:

- A one-line title (imperative mood, under 70 characters)
- A "## Summary" section: 2-4 bullet points on *what* changed and *why*, grouped by
  concern (routes, tests, docs, tooling) rather than by file
- A "## Test plan" section: a markdown checklist of what should be run or checked to
  verify the change (e.g. `npm test`, `npm run lint`, manual endpoint checks)

Do not include unrelated housekeeping (formatting-only diffs, lockfile churn) as a
bullet unless it's the only change in the diff. If the diff is empty, say so instead of
inventing a summary.
