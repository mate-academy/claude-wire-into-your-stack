# Notes

## Which server did you connect, why is it useful here, and what did your permission rule allow?

Connected the **filesystem** MCP server (`@modelcontextprotocol/server-filesystem`) at project scope, configured in `.mcp.json`. It's useful because it gives tools direct, structured filesystem access scoped to this repo rather than relying only on ad-hoc shell commands. The config scopes it to a single allowed root — `C:\Users\rober\kodree\claude-wire-into-your-stack` — so it can only read/operate within this project directory, not the wider filesystem.

## What repeated way of working did your skill capture, and how did you word the description so it fires?

Captured the **express-route-pattern** skill: validate input first, use async/await, return JSON responses, use the shared error handler, and add tests for both success and failure cases — the recurring checklist for touching any route in this API. The description was worded to name the trigger actions explicitly: "Use when creating a new route, modifying an existing endpoint, or adding route tests in this Express API," so it fires on those specific verbs rather than requiring an exact skill name match.

## What command did you add, and what makes it worth a shortcut?

Added two slash commands:
- **`/review-api`** — reviews current changes for route consistency, error handling, input validation, test coverage, and breaking changes, grouped by severity.
- **`/new-route`** — scaffolds a new route from `$ARGUMENTS`, adjusted to match this project's actual conventions (no controller layer, inline validation, `db/store.js` access, tests).

Both are worth a shortcut because they encode a multi-step checklist (several review dimensions, or a multi-file scaffold) that would otherwise need to be re-typed or re-explained every time, and `/new-route` in particular had to be tailored to this repo's conventions rather than a generic Express pattern.

## What hook did you set — does it react or prevent, and on which event?

Set two hooks in `.claude/settings.json`:
- **PreToolUse** on `Bash`, running `.claude/hooks/block-rm-rf.sh` — this **prevents**: it inspects the command for recursive-force `rm` (`-rf`, `-fr`, `--recursive --force`) and exits with code 2 to block the tool call before it runs.
- **PostToolUse** on `Write|Edit` — this **reacts**: after a file is edited, it runs `prettier --write` on that file.

Both parse the hook's JSON payload with `node` instead of `jq`, since `jq` wasn't available in this environment.

## What did you run headless, and what did you lock down?

Ran `claude -p` in headless/print mode to generate documentation and summaries without an interactive session — attempts included documenting API routes and summarizing endpoint tests, e.g. 

`claude -p "Summarize all endpoints test" --allowedTools Read,Grep` . 

Locked down `--allowedTools` to read-only tools — `Read`, `Grep`, and optionally `Glob` — deliberately excluding `Write`/`Edit`, so the headless instance could inspect and summarize code but could not modify files or create new ones. 
