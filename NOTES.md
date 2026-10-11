# Notes

## Server

I connected the `fetch` MCP server at project scope (committed in `.mcp.json`). It needs no credentials and lets Claude pull in API references, such as the Express error-handling guide I fetched when writing the JSON error handler. The original `uvx` command wasn't installed here, so it runs as `python -m mcp_server_fetch` instead (`pip install mcp-server-fetch`). The permission rule in `.claude/settings.json` allows only `mcp__fetch__fetch`, the one read-only tool I use, rather than the whole server.

## Skill

`add-api-endpoint` captures how this project adds or changes an endpoint: a helper in `db/store.js`, one route file per resource mounted in `server.js`, validation with `400`/`404` and `{ "error": "message" }` responses, and `node:test` + `supertest` tests. The description names the triggering requests (add or change a route, endpoint or resource in this Express API) and says what it is not for (lint config, CI, docs), so it should fire on endpoint work and not on unrelated tasks.

## Command

`/review-conventions [base-branch]` reviews the current branch against the conventions in `CLAUDE.md` and runs `npm test` and `npm run lint`, ending with a verdict. It's worth a shortcut because it's the same checklist before every PR, and it's read-only: its `allowed-tools` cover only git reads, tests and lint. The base branch defaults to `main`.

## Hook

A `PostToolUse` hook on `Edit|Write` runs `.claude/hooks/lint-on-edit.js`. It reacts after the edit rather than preventing it. For each edited `.js` file it runs `eslint --fix`, and if errors remain it prints them to stderr and exits 2 so Claude sees and fixes them. It holds the project's lint standard without anyone having to remember. It uses `node_modules/eslint`, so a fresh checkout needs `npm install`.

## Headless

I ran a read-only branch summary:

```
claude -p "Summarise what changed on this branch compared to main in 5 bullet points or fewer. Use git log and git diff only." \
  --allowedTools "Bash(git log:*)" "Bash(git diff:*)" "Read"
```

I allowed only `git log`, `git diff` and file reads, which is all a summary needs. Everything else is denied rather than prompted, so with nobody watching it can't edit files, commit, push or run npm.
