# Notes: wiring Claude into the Course API

## Server (MCP)

I connected the **fetch** server (`uvx mcp-server-fetch`) at project scope in `.mcp.json`. It needs no credentials, and it fits this repo: the API is built on Express, and fetch lets Claude pull the official Express docs and compare them with our code instead of answering from memory. The permission rule in `.claude/settings.json` allows only `mcp__fetch__fetch`, the server's single read-only tool, not the whole server. I used it on a real task. I pulled the Express 5 routing guide and the v5 migration guide, then checked `routes/users.js` against them. That turned up a real bug: in Express 5, `req.body` is `undefined` when no body was parsed, so POST and PUT `/users` crashed with a 500 instead of returning a 400. The fix and the Express 5 upgrade live on a separate branch, `express5-users-validation`, so this PR contains only the Claude wiring.

## Skill

`.claude/skills/express-endpoint/SKILL.md` covers the change this project repeats most often: adding or changing an endpoint. Every such change touches the same five places in the same order. Those are the store helper in `db/store.js`, the route with its validation (400 for bad input, 404 for a missing record, always `{ "error": "..." }`), the mount in `server.js`, tests that cover every error branch, and `docs/api.md`. The skill ends by running `npm run lint` and `npm test`, as CI does. I made the description fire on concrete requests by including real examples ("add a DELETE /users/:id", "create a /posts resource", "change what PUT returns") and naming the files involved. It also lists what it does *not* cover: general Express questions, refactors that leave behaviour unchanged, and tooling or config changes. I tested it in a fresh session with "Add a DELETE /users/:id endpoint", without naming the skill. The resulting change (commit `1a4c262` on `express5-users-validation`) followed all the steps: a store helper, a route returning 400/404/204, tests for each branch, and updated docs.

## Command

`/find-todos` (`.claude/commands/find-todos.md`) lists every TODO and FIXME comment, grouped by file. It deserves a shortcut because I run it before every PR, to make sure nothing half-finished ships, and typing the same request each time is tedious. It needs no arguments. When I first ran it, the only match was the command file itself, because the codebase is currently clean. If that self-match gets noisy, the prompt can be told to skip `.claude/`.

## Hook

The hook is a **PostToolUse** hook on `Edit|Write`, so it **reacts** after a change instead of blocking one. It runs `.claude/hooks/eslint-fix.js`, which applies `eslint --fix` to the edited `.js` file. If errors remain, it exits with code 2 and sends the file:line, message and rule back to Claude, which can then fix them straight away. This enforces the standard CI already checks (`npm run lint`) at the moment the code is written, not after a push. I wrote the hook in Node rather than shell + `jq`, because `jq` isn't available everywhere (it wasn't on my machine), and Node works the same on Windows, macOS and Linux. The script skips non-JS files, files outside the project, and `node_modules`. If ESLint isn't installed yet, it exits silently. I triggered both branches on purpose. A Write containing `if (!!a)` was fixed to `if (a)`. An Edit that called an undefined function got the `no-undef` error sent back.

## Headless run

I ran a read-only docs-vs-code consistency check:

```
claude -p "Check that docs/api.md matches the actual endpoints in routes/*.js and server.js … Then run npm test … Do not modify any files." \
  --allowedTools "Read" "Grep" "Glob" "Bash(npm test)" \
  --max-turns 15 --output-format text
```

It can only read files and run one exact shell command, `npm test`. It can't run `git`, `npm install` or anything else, and `Edit`/`Write` aren't on the list. That means "do not modify any files" is guaranteed by the tool list, not just requested in the prompt. `--max-turns 15` limits how long it can run. It finished in about 24 seconds and left the working tree untouched. All 12 tests passed, and it found a real doc bug: the `:id` validation note sat under `GET /users`, which takes no id. I ran it on `express5-users-validation`, where the app code lives, and the fix is commit `13be298` there.
