---
description: Summarize what changed in the repo, either the working diff or since a given ref
argument-hint: [ref]
---

Summarize what changed in this repo. This is a read-only reporting task — do not stage,
commit, or otherwise mutate git state.

Arguments: `$ARGUMENTS`

- If no argument was given, summarize the current working tree: run `git status` and
  `git diff` (staged and unstaged), and include untracked files (read their content to
  understand what they add).
- If an argument was given (a commit SHA, branch name, or range like `HEAD~3`), summarize
  the changes between that ref and the current working tree instead — use `git diff <ref>`
  and `git log <ref>..HEAD` for the commit history in between.

Produce a concise prose summary, grouped by area of this repo rather than a raw diff dump:
- `routes/` — which resource(s) changed, and the nature of the change (new route, modified
  validation, status codes, etc.)
- `db/store.js` — new or modified helpers
- `tests/` — new or modified test coverage
- `docs/api.md` — documentation changes
- anything else (config, `server.js`, dependencies, etc.)

For each area only mention it if something actually changed there. Note whether the changes
follow this repo's conventions (see `CLAUDE.md`) — route validation returning 400/404 with
`{ "error": "message" }`, and all data access going through `db/store.js` — and flag anything
that looks like drift. Keep the summary tight: a few bullets per area, not a line-by-line
walkthrough.
