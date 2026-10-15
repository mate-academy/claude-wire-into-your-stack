# Notes

## 1. MCP Server

Connected `@modelcontextprotocol/server-filesystem` pointing at `./docs`. The project already has `docs/api.md` as its API reference, so this gives Claude a way to read that documentation through the MCP protocol rather than a plain file read — useful when asking questions about endpoints without opening the file manually. No credentials required.

Permission rule allows only `mcp__docs__read_file` and `mcp__docs__list_directory` — the two read-only tools the server exposes. Write tools (`create_file`, `move_file`, etc.) are not listed and therefore not auto-approved.

## 2. Skill

The project has a clear, repeating pattern for adding a new resource: create `routes/<resource>.js`, add store methods to `db/store.js`, mount the router in `server.js`, and write tests in `tests/<resource>.test.js`. Every route follows the same conventions (400 on bad input, 404 on missing record, 201 on POST, all data through the store).

The skill is in `.claude/skills/add-route/SKILL.md`. The description says to trigger when the user asks to "add a new resource, route, or endpoint" and explicitly says not to trigger for editing existing routes or bug fixes. Tested by asking "Add a products resource to the API" without naming the skill — Claude picked it up and created the correct files following the pattern.

## 3. Command

`/route-checklist <filename>` reviews a route file against the six project conventions (store-only data access, 400/404 error shapes, correct status codes, proper export, allowed dependencies). Saved in `.claude/commands/route-checklist.md` with `$ARGUMENTS` for the filename. Useful as a quick pre-commit check or after any route edit.

## 4. Hook

`PostToolUse` on `Edit|Write` tools runs `npm run lint --silent`. This is a reactive hook — it fires after every file edit, not before, so it doesn't block Claude from making changes but does surface any lint violations immediately. Committed in `.claude/settings.json` so every teammate gets the same automatic check on checkout.

## 5. Headless task

Task: read `routes/users.js` and `routes/health.js` and output a markdown table of all endpoints.

```
claude -p "Read routes/users.js and routes/health.js. Output a markdown table with columns: Method, Path, Required body fields, Success status, Error cases." --allowedTools "Read"
```

`--allowedTools "Read"` is the only tool needed — the task is purely reading two files. No `Write`, `Edit`, or `Bash` access. Safe to run unattended because it cannot modify anything.
