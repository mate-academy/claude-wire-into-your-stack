# NOTES

How Claude Code is wired into this repo, and why each piece is there.

## MCP server: `fetch`

We connected the `fetch` server (`uvx mcp-server-fetch`) at project scope, so it lives in the committed `.mcp.json` and anyone who clones the repo gets it. It's useful here because working on an Express API often means checking the Express, Node test runner, or supertest docs, and `fetch` pulls those pages straight into the session. It needs no credentials, so there are no secrets to keep out of the repo. The permission rule in `.claude/settings.json` allows only `mcp__fetch__fetch`, the one read-only tool we use, and doesn't blanket-allow the whole server.

## Skill: `express-route`

The skill captures how routes are written in this project: one router file per resource, mounted in `server.js`, all data going through `db/store.js` (with `seed()` extended so `reset()` still works), `400` on bad input, `404` on a missing record, errors shaped `{ "error": "..." }`, and tests for the happy path, 400, and 404. The description lists the verbs and example phrasings people actually use ("add a /products route", "create a POST endpoint for orders", "add DELETE /users/:id", "add a handler to an existing router"), so it fires when someone asks for a route without naming the skill. It's tied to `routes/` and this API's conventions so it stays quiet on unrelated work. The `/products` route (commit `5ee003c`) was built from this pattern.

## Command: `/review-route`

`/review-route <file>` reviews a route file against the project checklist: error shape, validation before the store call, 404 on `:id` lookups, success codes, no state in the route, wiring, and house-style comments. It also checks the matching test file and runs `npm test`. It's read-only (`allowed-tools: Read, Grep, Glob, Bash(npm test:*)`) and ends with a verdict, findings with `file:line`, and a coverage table. It's worth a shortcut because we run this same long checklist on every new route, and saving it means every review is complete and consistent instead of depending on how the prompt was typed that day.

## Hook: lint after `.js` edits (PostToolUse)

A `PostToolUse` hook on `Write|Edit|MultiEdit` checks whether the edited file is a `.js` file and, if it is, runs `npm run lint`. When lint fails, it exits with code `2` and sends the ESLint output back to Claude, which then fixes the problem in the same turn. It reacts instead of preventing because lint can only judge code after it's written: a PreToolUse hook has no finished file to check, and blocking the edit would also block the fix. Reacting right after the edit means a lint error never stays in the code, which is the same standard CI enforces.

## Headless run

We ran one read-only task headless:

```sh
claude -p "summarize what routes this project exposes and what each one does" --allowedTools "Read"
```

We limited it to `Read` because the task only had to read files. It didn't need to write, edit, or run anything. With no `Write`/`Edit`, no `Bash`, and no MCP tools allowed, a run with nobody watching can look at the code but can't change it or execute commands.
