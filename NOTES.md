# Notes: wiring Claude into the Course API

## Server (MCP)

I connected the **filesystem** server (`@modelcontextprotocol/server-filesystem`) at project scope in `.mcp.json`. It starts through `scripts/mcp-filesystem.sh`, which works out the repo path from the script's own location, so it works in any clone and under WSL. It needs no credentials. It is useful here because most questions about this API ("is the doc right?", "what does this route return?") come down to reading `docs/api.md` next to `routes/` and `db/store.js`.

The permission rule in `.claude/settings.json` allows only `mcp__filesystem__read_text_file`. The server's write, edit and move tools are not pre-approved and still ask first.

I used it to compare `docs/api.md` with the route files. The docs matched the code, but the comparison showed that `GET` and `PUT /users/:id` answered `404` for a non-integer id such as `/users/abc`. The project's rule is `400` for bad input.

## Skill

`.claude/skills/add-api-endpoint/SKILL.md` covers the way this project changes an endpoint. Every endpoint change touches the same five places, in order: the `db/store.js` helper, the route (validate, then the store call, then `404`, then success), the `server.js` mount, one test per possible status code, and the `docs/api.md` section. It also includes the status-code table and the `{ "error": "..." }` shape.

The description names the trigger: adding, changing or removing an HTTP endpoint in this API. It gives example requests in the words people actually use, such as "return 400 for bad ids", lists the files the skill covers, and says what it is *not* for (CI, ESLint, MCP or Claude settings, refactors). To confirm it fires, I gave a fresh headless session this request, which doesn't name the skill: *"GET /users/abc and PUT /users/abc currently answer 404. Make them return 400 for a non-integer id."* It loaded `add-api-endpoint` by itself and changed the route, tests and docs. Its tests and lint passed.

## Command

`/review-conventions [scope]` reviews API changes against the project's 8-point checklist: store, router, validation, `404`, success codes, error shape, tests, docs. It takes `$ARGUMENTS` as one free-form scope:
- empty means uncommitted changes,
- a git ref or range such as `main...HEAD`,
- or file paths.

Its `allowed-tools` limit it to reading files and `git diff/status/log`, so it can't edit anything. It's worth a shortcut because every endpoint change should get this same check, and typing the checklist out each time means items get skipped. On its first run it passed the `400` fix and flagged three test gaps that already existed before the fix.

## Hook

`.claude/settings.json` has a **`PostToolUse`** hook on **`Edit|Write`** that runs `scripts/hooks/lint-on-edit.js`. It **reacts** rather than prevents, because a lint check can only judge a file after it has been written. The script only lints `.js` files in the same scope as `npm run lint` and runs `eslint --fix` first. If errors remain, it exits with code 2, which sends them back to Claude to fix before moving on. Warnings don't block.

I wrote it in Node rather than `jq`, because everyone working on this project has Node. To test it, I added an undefined function call to `routes/health.js`. The hook returned `'hookTestUndefined' is not defined (no-undef)` straight after the edit.

## Headless run

I ran a well-scoped task with nobody watching: add the three missing tests that `/review-conventions` had flagged.

```bash
claude -p "tests/users.test.js is missing three cases: a 200 test for GET /users/:id (user 1 is Ada Lovelace), a 400 test for PUT /users/:id with an empty body, and the 404 tests for GET and PUT don't assert res.body.error. Add them following the existing test conventions, then run npm test and report the result. Do not change anything outside tests/." \
  --allowedTools "Read" "Grep" "Glob" "Edit(tests/**)" "Bash(npm test)"
```

What each allowed tool is for, and what that locks down:
- **`Read`, `Grep`, `Glob`:** let it read the routes and existing tests.
- **`Edit(tests/**)`:** it can write only test files, not routes, the store, docs or settings.
- **`Bash(npm test)`:** the only shell command it can run, so it can't use `git`, install packages, delete files or reach the network.

In headless mode anything not on the list is denied automatically. The run changed only `tests/users.test.js`, `npm test` passed 7 of 7, and nothing was denied. I ran it in a throwaway clone, so those tests aren't part of this branch.

## Trying it on a fresh checkout

1. Run `npm ci`.
2. Start `claude` in the repo and approve the project's `filesystem` MCP server when asked.
3. The skill, the `/review-conventions` command and the lint hook come from the committed `.claude/` folder and need no setup.
