# Notes: wiring Claude into the Course API

## Server (MCP): Context7

`.mcp.json` connects the remote Context7 server (`https://mcp.context7.com/mcp`) at project scope. It serves current, version-specific docs for the libraries this repo depends on (Express 4, supertest, Node's test runner), so Claude checks real APIs instead of guessing from memory. It needs no API key and nothing to install, so it works for every teammate right after cloning. I picked it over the fetch server because that one needs Python's `uvx`, which this Node project doesn't otherwise require.

The permission rule in `.claude/settings.json` allows only its two read-only tools, `mcp__context7__resolve-library-id` and `mcp__context7__query-docs`, not the whole server. I first used it to answer a real question for the skill: what a DELETE route should send in Express 4. The docs pointed to `res.status(204).end()`, because `res.sendStatus(204)` sends a text body. That answer is now in the skill.

## Skill: `add-endpoint`

Every endpoint in this repo touches the same five places: a helper in `db/store.js`, the route file, the mount in `server.js`, a supertest test that calls `store.reset()`, and an entry in `docs/api.md`. It also follows the same status-code and `{ "error": "message" }` rules. The skill writes that sequence down with code in the repo's own style.

The description names the requests it should fire on ("adding or changing an HTTP endpoint", with examples like `/posts` and `DELETE /users/:id`, plus validation, status-code and response-body changes). It also says what it is not for: reviewing a diff, lint or CI config, or questions that change no code. I tested this on a fresh checkout. "Add a DELETE /users/:id endpoint" made Claude call the skill first, and the result passed tests and lint. "Which Node version does CI use?" did not fire it.

## Command: `/check-conventions [base]`

This command reviews the branch, committed and uncommitted changes together, against a 7-item checklist taken from `CLAUDE.md` and the existing code. It returns a verdict, findings as `path:line` with the broken rule, and pass/fail for each item. It is read-only: its `allowed-tools` lets it run `git diff/status/log` and read files, and nothing else. It is worth a shortcut because it is the check I would otherwise retype before every PR. It is also the review side of the skill, so the two don't overlap. When I planted a `{ message }` body in a DELETE route, it flagged that exact line as breaking the 204 rule and noted that the test would fail.

## Hook: ESLint after every edit (PostToolUse)

This hook reacts after a change. It runs on the `PostToolUse` event, with matcher `Edit|Write|MultiEdit`. Its command, `.claude/hooks/lint-edited-file.js`, runs the project's ESLint on the `.js` file Claude just changed. On lint errors it exits 2, so Claude gets the errors and fixes them right away. This holds the same standard CI enforces (`npm run lint`), but at the moment of the edit instead of after a push.

I chose to react, not prevent, because a lint error can't be seen until the file exists. I avoided an auto-formatter because adding Prettier would change `package.json`, which is outside this task. The hook never blocks for a reason that isn't a lint error. It skips non-JS files and files outside the repo, it skips quietly if `node_modules` isn't installed yet, and if ESLint itself crashes it reports a non-blocking error. I triggered it on purpose by writing `module.exports = missingHelper;`. It fired with exit 2, and Claude received the `no-undef` error.

## Headless run

```sh
claude -p "Audit docs/api.md against the code in server.js and routes/. For every endpoint, check that the method, path, required body fields, status codes and error messages in the docs match the code. Output a markdown table with columns Endpoint | Docs | Code | Match (yes/no), then one line listing any mismatches or 'No drift found'. Read only; do not change files and do not ask questions." \
  --allowedTools "Read" "Grep" "Glob" --output-format json
```

This is a docs-drift audit: it checks `docs/api.md` against the routes. It only needs to read, so I allowed only `Read`, `Grep` and `Glob`. No Edit, Write, Bash, or MCP tools, which means a bad prompt can't change files or run commands. It returned a 5-row table and "No drift found" in 7 turns, with 0 permission denials.

## Checking it on a fresh checkout

1. Run `npm ci`, so the hook can find ESLint.
2. Run `claude` and approve the `context7` server when asked. Servers from `.mcp.json` always need this one-time approval per person.
