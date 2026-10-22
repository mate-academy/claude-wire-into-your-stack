# Notes: wiring Claude into this project

## 1. Server (MCP)

I connected the **fetch** server (`uvx mcp-server-fetch`) at project scope, so it's in the committed `.mcp.json` and needs no API key. It lets Claude read web pages it otherwise can't, which is useful here for checking our code and `docs/api.md` against the official Express docs. The permission rule in `.claude/settings.json` allows only `mcp__fetch__fetch`, the server's single read-only tool, rather than the whole server. I used it to compare `express.json()`'s documented behaviour with `docs/api.md`. That run also showed it can pull the wrong version's docs (it fetched Express 5 pages, but we use Express 4), which I fed into the skill below.

## 2. Skill

`add-api-endpoint` captures how this repo adds an endpoint: a helper in `db/store.js`, a handler in `routes/<resource>.js` that returns `400`/`404` with the `{ "error": "message" }` shape, mounting in `server.js`, supertest tests that reset the store, an entry in `docs/api.md`, and a final `npm test` and `npm run lint`. It also notes that the project is on Express 4. The description names the action ("adding a new HTTP endpoint or route to this Express API"), gives example requests such as "add DELETE /users/:id", and ends with what it is *not* for (questions about existing endpoints, test-only changes, edits outside `routes/`). I asked "Add an endpoint to delete a user by id." without naming the skill, and Claude loaded `Skill(add-api-endpoint)` as its first step.

## 3. Command

`/summarize-changes` summarises the current branch against `main`, or against another branch passed in as `$ARGUMENTS`. It groups changes by area, lists API changes, and checks them against the conventions in `CLAUDE.md`, such as a route changed without a test or `docs/api.md` left out of date. It's worth a shortcut because I'd want it before every commit or PR, and it pre-approves only read-only `git` commands, so it runs without prompts and can't change anything. The first run guessed at two files (it said `settings.json` "likely" enabled the server, and claimed fetch could call our local API, which it refuses by default), so I added a rule that each file must be described only from what the diff shows.

## 4. Hook

The hook **reacts** on **`PostToolUse`**, matching `Edit|MultiEdit|Write`. It runs `.claude/hooks/lint-after-edit.js`, which lints just the edited file when it's one `npm run lint` covers. On any error or warning it exits with code 2, which sends the ESLint report back to Claude so it fixes the problem before moving on. I tested it by asking Claude to add a call to an undefined `checkDatabase()` in `routes/health.js`, and the hook reported the `no-undef` error straight away. One limitation: an `// eslint-disable` comment can still silence it, and Claude reached for exactly that in the test.

## 5. Headless run

I ran a project health check with `claude -p`: run the tests, run lint, and check each route against `CLAUDE.md`, without changing any files. `--allowedTools` allowed only `Read`, `Grep` and `Glob` to look at the code, plus the exact commands `Bash(npm test)` and `Bash(npm run lint)`. That locks out `Edit` and `Write`, and every other shell command. With nobody there to answer a prompt, anything not on the list is refused rather than asked about. The project's own `mcp__fetch__fetch` permission also applies headless, but that tool is read-only. The run reported 5 passing tests, clean lint and no convention breaks, and left the working tree unchanged.
