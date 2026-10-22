# Notes: wiring Claude into the course API

Everything below is committed, so anyone who clones the repo gets the same setup.

## Server (MCP)

I connected the official filesystem server (`@modelcontextprotocol/server-filesystem`, pinned to `2026.7.10`) at project scope in `.mcp.json`, pointed only at `./docs`. It is useful here because `docs/api.md` is the contract every endpoint has to match, and it needs no credentials. The server also has write tools (`write_file`, `edit_file`, `move_file`), so the rule in `.claude/settings.json` allows only the three read-only tools I use: `mcp__docs__read_text_file`, `mcp__docs__list_directory` and `mcp__docs__search_files`. Anything else still asks first. I used it to list the documented endpoints ("api.md documents GET /health, GET /users, GET /users/:id, POST /users and PUT /users/:id").

## Skill

`.claude/skills/add-endpoint/SKILL.md` captures how an endpoint is built in this repo: a helper in `db/store.js`, the route in `routes/<resource>.js` with `400`/`404` and `{ "error": "message" }`, tests with `supertest` and `store.reset()`, and a section in `docs/api.md`, then `npm test` and `npm run lint`. The description names the trigger (adding or changing a GET/POST/PUT/PATCH/DELETE route), gives two example requests and says what it is not for, so it does not fire on unrelated edits. I tested it by asking "Add a DELETE /users/:id endpoint to the API." without naming the skill: Claude loaded `add-endpoint` on its own and followed every step (store helper, `204`/`404` route, two tests, docs; 7 of 7 tests passing). That run was in a scratch copy, so the DELETE route is not part of this branch.

## Command

`/review-changes [base]` (`.claude/commands/review-changes.md`) reviews the branch against the checklist in CLAUDE.md, runs the tests and lint and answers as Must fix / Should fix / Looks good, without editing files. `$ARGUMENTS` is the base branch and defaults to `main`. It is worth a shortcut because I would type this before every PR. On the scratch DELETE change it found nothing to block and pointed out that `/users/abc` gives `404` instead of `400` (the same is true for every route) and that there is no test for deleting twice.

## Hook

A **PostToolUse** hook with the matcher `Edit|MultiEdit|Write` runs `.claude/hooks/lint-edited-file.js`. It **reacts** after a `.js` file in the project changes: it runs `eslint --fix` on that file, and if errors are left it exits with code 2, so Claude sees the ESLint output and has to fix it. The standard it holds is the same one CI enforces (`npm run lint`), but at the moment of the edit. I saw it fire on each `Edit` in the skill test run, and I fed it a file with an undefined variable to confirm it blocks (exit 2 with the `no-undef` error).

## Headless run

```
claude -p "Run npm test and npm run lint, then report in two lines how many tests passed and whether lint found any problems. Do not change any files." \
  --allowedTools "Bash(npm test)" "Bash(npm run lint)" --disallowedTools "Edit" "Write"
```

Output: "Tests: 5 of 5 passed, with 0 failures. Lint: ESLint found no problems." I allowed only the two exact npm scripts, not `Bash(npm:*)` or general Bash, so nothing else can run with nobody watching, and I denied edits outright. One thing I learned: in a folder that has not been trusted yet, Claude ignores the `permissions.allow` rules from `.claude/settings.json`, so a headless run has to name what it needs in `--allowedTools`.
