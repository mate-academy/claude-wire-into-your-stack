# Notes

## Server (MCP)
I connected the filesystem MCP server at project scope in `.mcp.json`, pointed only at the `docs/` folder. Claude can read the API docs (`docs/api.md`) while working on routes, so it keeps the docs and the code in sync. The permission rule in `.claude/settings.json` allows only the read-only tools (read file, list directory, search files); write tools are not allowed, so the server cannot change the docs on its own.

## Skill
`express-route-conventions` captures how routes are written in this repo: store-only data access, `{ error: '...' }` JSON errors with 400/404, 201 on create, a test for each endpoint and an entry in `docs/api.md`. The description names the concrete situation ("adding, changing or reviewing an HTTP endpoint or Express route in routes/") with an example request, so it fires on route work and not on unrelated tasks.

## Command
`/review-route <file>` reviews a route file against the same checklist and returns ✅/❌ per rule without editing anything. It is worth a shortcut because I run this check before every PR that touches a route.

## Hook
A PreToolUse hook on the Bash tool runs `.claude/hooks/block-risky-commands.js`. It prevents (not reacts) `rm -rf`, `git push --force` and `git reset --hard`, by exiting with code 2 so Claude gets the reason and does not run the command.

## Headless run
I ran: `claude -p "Run the test suite and summarise the results" --allowedTools "Bash(npm test)" "Read"`.
Only `npm test` and reading files were pre-approved: the task needs to run tests and look at failing files, nothing else, so Claude cannot edit code, install packages or run any other shell command with nobody watching.
