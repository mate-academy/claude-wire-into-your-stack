# Notes: wiring Claude into the course API

## Server (MCP)
I connected the official filesystem server (`@modelcontextprotocol/server-filesystem`, version pinned) at project scope in `.mcp.json`, rooted at `./docs`. It needs no credentials. It gives Claude a direct way to read the API reference (`docs/api.md`) when it adds or reviews endpoints. In `.claude/settings.json`, `permissions.allow` covers only its three read-only tools: `mcp__docs__read_text_file`, `mcp__docs__list_directory` and `mcp__docs__search_files`. The write, edit, move and create-directory tools are explicitly denied, so the server can't change the docs. I used it once to read `api.md` and list every documented endpoint, and it returned all five. A teammate approves the server once on first run.

## Skill
`.claude/skills/express-route/SKILL.md` records how a route gets added in this repo: one router per resource, all state in `db/store.js`, 400/404/201/204 status codes, `{ "error": "..." }` error bodies, a success test plus an error-case test, an entry in `docs/api.md`, and passing `npm test` and `npm run lint`. The description says what it does ("add or change an Express route or endpoint in this course API"). It also names the requests that should trigger it: a new endpoint, a new resource, or a new HTTP method under `routes/`. That way it fires on route work and stays out of everything else. To test it, I asked "Add a DELETE /users/:id endpoint" without naming the skill, and Claude loaded `express-route` on its own. I reverted that test change because this project shouldn't change app behaviour.

## Command
`/review-route <file>` (`.claude/commands/review-route.md`) reviews one route file against the project's seven-point checklist and marks each point PASS or FAIL with line numbers. It is read-only, and it ends with a ranked list of fixes. A review is worth a shortcut because it should be identical every time, and typing the full checklist each time leads to drift. I ran it on `routes/users.js`. It flagged real gaps: PUT accepts empty strings, and there's no success test for GET /users/:id and no 400 test for POST.

## Hook
A **PostToolUse** hook with the matcher `Write|Edit` runs `.claude/hooks/lint-edited-file.js`. The script runs `eslint --fix` on any `.js` file Claude just wrote or edited. It reacts rather than prevents. If errors remain that ESLint can't fix, the script exits with code 2, which sends the ESLint output back to Claude so Claude fixes the file straight away. Lint clean is a standard every edit should meet, so it should never depend on someone remembering to run lint. I tested it by having Claude write `notDefined();` to a file, and the hook reported `no-undef` back to Claude.

## Headless run
```
claude -p "Run the test suite and the linter, then report ... Do not edit anything." \
  --allowedTools "Bash(npm test),Bash(npm run lint)" --max-turns 5
```
The only pre-approved commands are those two exact ones. The run can't edit files, run any other shell command, or reach the network, and `--max-turns` caps how long it can go on. The result: 5/5 tests passed, 0 lint problems. This is the job I'd put on a schedule or in CI.
