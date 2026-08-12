# Notes

## MCP server
Connected the `docsfs` filesystem MCP server at project scope, scoped to the `docs` folder. Only `read_text_file`, `list_directory`, and `search_files` are allowed.

## Skill
`route-conventions` captures the repeated Express route workflow for this project. Its description is narrow so it only triggers for route-related work.

## Command
`/review-route` reviews a supplied route or file, checking input validation, HTTP status codes, JSON error shape, `db/store.js` access, consistency with other routes, and test coverage.

## Hook
A `PreToolUse` Bash guard blocks `git push --force` and `git push -f` before they execute.

## Headless task
Ran `claude -p` headlessly with only the `Read` tool allowed to summarize `docs/api.md`.

---

All five (MCP server, skill, command, hook, headless task) have been tested and confirmed working.
