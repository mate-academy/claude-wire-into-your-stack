---
description: Summarize what changed on this branch compared to main
---

Summarize the changes on the current branch compared to `main`.

Target: $ARGUMENTS (if empty, compare the current branch against `main`; if given,
treat it as a git ref, range, or the word "staged" for `git diff --staged`)

Steps:
1. Run `git status` and the appropriate `git diff`/`git log` against the target to see
   what changed.
2. Group the changes by area (routes, store, tests, docs, config) using this repo's
   structure (see CLAUDE.md) as a guide.
3. For each area, give a 1-2 sentence summary of *why* the change matters, not just
   which files moved.
4. Flag anything that looks incomplete: a route without a matching test, a store
   change without a route using it, or docs/api.md left out of sync with routes/.

Keep the whole summary under ~200 words unless the diff is large enough to need more.
