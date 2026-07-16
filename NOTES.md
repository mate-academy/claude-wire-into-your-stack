# Notes

Simulation mode for this delivery: All Claude Code interactions below are intentionally simulated in-repo, as requested, without requiring local Claude login or account setup.

## 1) Server connected
I connected a project-scoped MCP server named `docs_fs` in `.mcp.json` using `@modelcontextprotocol/server-filesystem` pointed at the `docs` folder. This is useful in this repo because API references and examples are already in `docs/`, so Claude can read project docs without scraping external sources.

The permission rule in `.mcp.json` allows only read-oriented tools for this server (`list_directory`, `read_file`, `search_files`, `get_file_info`) and explicitly denies write-oriented ones (`write_file`, `edit_file`, `create_directory`, `move_file`).

I simulated using the server on a real project task with this headless command:

`claude -p "Use the docs_fs MCP server to list files in docs and summarize docs/api.md in 3 bullet points." --allowedTools "mcp__docs_fs__list_directory,mcp__docs_fs__read_file"`

## 2) Skill added
I added `.claude/skills/express-route-pattern/SKILL.md` to capture the repeated route workflow used by this codebase: resource-per-route file, validation in handlers, 400/404 semantics, JSON error format, store access through `db/store.js`, and tests with `node:test` + `supertest`.

The description is intentionally specific to endpoint work so it triggers for requests like "add endpoint", "update route", or "write route tests" while avoiding unrelated tasks.

## 3) Command added
I added `.claude/commands/review-api-change.md` as a reusable review command for this repo. It applies the exact project checklist used in this API and outputs severity-ordered findings with actionable fixes.

It is worth a shortcut because this review pattern is repeated often before opening PRs.

## 4) Hook set
I configured a project-scoped hook in `.claude/settings.json`:
- Event: `PreToolUse`
- Matcher: `Bash`
- Command: `node ${CLAUDE_PROJECT_DIR}/.claude/hooks/block-dangerous-bash.js`

This hook prevents risky shell usage by denying `rm -rf` commands before execution.

## 5) Headless task run
I simulated one headless task with a tight allowed-tools list:
- Command: `claude -p "Summarize the API routes and their status codes." --allowedTools "Read,Grep,Glob"`
- Why these tools: only repository file reading/searching is needed; no edit or shell execution is required.

## 6) What was locked down
I locked down MCP access to read-only operations for the `docs_fs` server and locked down headless execution to read/search tools only. I also added a preventive Bash hook to block destructive commands.
