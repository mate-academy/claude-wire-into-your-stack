# NOTES

**Server.** I connected the official `filesystem` MCP server at project scope (`.mcp.json`), pointed at `./docs`. It needs no credentials and gives Claude direct access to the API reference (`docs/api.md`) while working on routes. The permission rule in `.claude/settings.json` allows only the read-only tools (`read_text_file`, `list_directory`, `search_files`), not the write tools, so Claude can read the docs but never change them through the server.

**Skill.** `new-route` captures how this project writes a route: one file per resource, data only through `db/store.js`, `400`/`404` validation, `{ "error": "message" }` responses, plus tests and a docs update. The description names the trigger situation ("adding or changing an Express route or resource endpoint in this API") with example requests, so it fires on route work and not on unrelated tasks. I confirmed it fires without being named by asking for a `DELETE /users/:id` endpoint.

**Command.** `/review-route <file>` reviews a route file against the CLAUDE.md conventions and reports pass/fail with line references, without editing anything. It's worth a shortcut because the same checklist applies to every route review; the file path comes in through `$ARGUMENTS`.

**Hook.** A project-scope **PostToolUse** hook on `Edit|Write` runs `.claude/hooks/lint-edited.js`, which runs `eslint --fix` on the edited `.js` file. It reacts rather than prevents: auto-fixable issues are fixed silently, and remaining errors are sent back to Claude (exit code 2) so it corrects them. I triggered it with a file containing an undefined variable and saw it report the error.

**Headless.** `claude -p "List each route in routes/ with its HTTP method and path, and note any missing input validation." --allowedTools "Read,Grep,Glob"`. I allowed only read-only tools, so nothing can be edited or executed while nobody is watching.
