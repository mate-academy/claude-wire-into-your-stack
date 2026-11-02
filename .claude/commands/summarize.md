---
description: Summarize what has changed since the last update (last commit plus uncommitted work)
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git show:*)
argument-hint: [optional git ref to compare against, default HEAD]
---

Summarize the changes in this repository since the last update.

Reference point: `$ARGUMENTS` if given, otherwise `HEAD` (the last commit).

Current state:

!`git status --short`

Commits since the reference point (if any):

!`git log --oneline ${ARGUMENTS:-HEAD}..HEAD`

Diff stats for uncommitted changes against the reference point:

!`git diff ${ARGUMENTS:-HEAD} --stat`

Instructions:

1. Read the full diff for every changed file (`git diff ${ARGUMENTS:-HEAD}` for tracked files, and read untracked files directly). Don't summarize from file names alone.
2. Group the changes by purpose, not by file. For example: new endpoints, data layer changes, tests, configuration, docs.
3. For each group, state what changed and why it matters for the API's behavior (routes, status codes, data, tests). Mention any new or changed endpoints by method and path.
4. Call out anything risky: removed behavior, changed status codes, untested paths, or files that look unintended (such as generated or machine-local files).
5. If there are no uncommitted changes and no new commits, say so and stop.

Keep the summary short: a few bullets per group, and no more than about 25 lines in total.
