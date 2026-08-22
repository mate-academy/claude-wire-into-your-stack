# Claude Integration Notes
## Server (MCP)
**Which server:** @modelcontextprotocol/server-fetch
**Why it's useful:** Enables Claude to fetch API documentation and external JSON data directly, useful for comparing API responses.
**Permission rule:** Only allows `fetch::fetch` and `fetch::fetchJson` — read-only, no write capabilities.
---
## Skill
**Repeated way of working:** Express route patterns — consistent error handling, JSON response format, JSDoc comments.
**Trigger wording:** "create a route", "add an endpoint", "new API endpoint"
---
## Command
**Command added:** /review
**Why worth a shortcut:** Running a code review against project standards is repetitive; this saves typing the full checklist each time.
---
## Hook
**Hook type:** PostToolUse
**Event:** Fires after every `bash` command execution
**Purpose:** Logs all terminal commands for audit trail
---
## Headless Task
**Task run:** Running tests
**Tools locked down:** Bash (for npm test), Read (for output)
**Why safe:** Only executes pre-approved commands, no file modification allowed.
