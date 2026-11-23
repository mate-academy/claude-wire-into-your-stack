# Claude Code setup notes

## 1. MCP server: `docs`

A project-scoped filesystem MCP server named `docs` is defined in `.mcp.json`. It is limited to `./docs` and needs no credentials. It is useful because `docs/api.md` is the API reference, which Claude reads when writing routes. `permissions.allow` in `.claude/settings.json` only permits `mcp__docs__read_text_file` and `mcp__docs__list_directory`, so the write-capable tools still prompt for approval. I used it on a real task: list_directory found docs/api.md and read_text_file read it to list the five documented endpoints, so both allowed tools are in use.

## 2. Skill: `express-route`

The skill in `.claude/skills/express-route/SKILL.md` covers the project's route conventions: input validation, 400/404/201 responses, the `{ "error": "message" }` error shape, mounting in `server.js`, tests, and updating `docs/api.md`. Its description names the task and trigger words (new endpoint, route, resource, GET/POST/PUT/DELETE, validation, errors), so it loads on matching requests. I tested it with a Romanian request, „Adaugă o rută DELETE /users/:id” (“Add a DELETE /users/:id route”), without naming the skill, and Claude loaded express-route first.

## 3. Custom command: `/check-route`

`/check-route <file>` is defined in `.claude/commands/check-route.md` and uses `$ARGUMENTS` as the file path. It checks a route file against the project conventions and reports problems with line numbers, without editing anything. It is a shortcut for the review I run before each PR. I ran it on `routes/users.js` and `routes/health.js`.

## 4. Hook: block force-push

A `PreToolUse` hook in `.claude/settings.json` matches `Bash|PowerShell`, since Claude uses PowerShell on Windows. On Windows, Claude Code has a separate PowerShell tool besides Bash, so matching only Bash would let a force-push through PowerShell bypass the guard. It runs `.claude/hooks/block-force-push.js` through `node`, so it works on any OS. The script blocks `git push` with `--force`, `-f`, or `--force-with-lease` (exit code 2) and allows normal pushes. Verified both cases: live, `git push --force --dry-run` was blocked with the hook message; fed directly to the script, `git push -f` and `--force-with-lease` exit 2, while `git push origin wire-claude` and `git status` exit 0. After review, the script no longer matches the literal text "git push": it splits the command into segments, skips Git global options such as -C <path> and -c <key=value>, and checks the push arguments, so git -C <path> push --force is blocked too.

## 5. Headless run: list routes

`claude -p` with `--allowedTools "Read,Grep,Glob"` and `--max-turns 5` lists the routes. Only read tools are allowed because the task should not modify files or run commands. The turn limit stops a run that goes off track.

```bash
claude -p "List every route in routes/ as a table with HTTP method, path and file. Do not edit anything." --allowedTools "Read,Grep,Glob" --max-turns 5
```

Result: a table of the 5 routes (GET /health, GET /users, GET /users/:id, POST /users, PUT /users/:id), and no files were edited.
