---
description: Summarise what changed on this branch compared to a base branch (default main)
argument-hint: "[base branch, default main]"
allowed-tools: Bash(git status:*), Bash(git log:*), Bash(git diff:*), Bash(git branch:*)
---

Summarise what changed on the current branch. This is read-only: do not edit,
stage, commit or push anything.

Base branch: $ARGUMENTS
If no base branch is given above, use `main`.

Gather the changes with these commands only:
- `git branch --show-current`
- `git log --oneline <base>..HEAD`
- `git diff --stat <base>...HEAD`
- `git diff <base>...HEAD`
- `git status --short` (for work that isn't committed yet)

Describe each file only from what its lines in the diff actually show. Read
the full diff before writing; never describe a file from its name or path
alone. Do not guess at what a change enables or is for, and do not use words
like "likely" or "probably". If the diff doesn't make a change's effect clear,
say exactly what lines changed and add "(effect unclear from the diff)".

Then reply in exactly this format:

## Summary
One or two sentences on what this branch does overall.

## Changes by area
Group the changed files under these headings, skipping any with no changes.
For each file, one line on what changed and why it matters:
- **Routes** (`routes/`, `server.js`)
- **Data** (`db/`)
- **Tests** (`tests/`)
- **Docs** (`docs/`, `README.md`, `CLAUDE.md`)
- **Claude setup** (`.mcp.json`, `.claude/`)
- **Other**

## API changes
List every endpoint added, removed or changed, with its method, path and
status codes. Write "None" if no route behaviour changed.

## Checks
Using this project's conventions from `CLAUDE.md`, flag anything missing, such as:
- a route changed without a matching test in `tests/`
- an endpoint added or changed without an update to `docs/api.md`
- an error response that isn't `{ "error": "message" }`
- route code that holds data instead of going through `db/store.js`
Write "No issues found" if everything lines up.

## Not committed
List any uncommitted or untracked files from `git status`, or write "Nothing".
