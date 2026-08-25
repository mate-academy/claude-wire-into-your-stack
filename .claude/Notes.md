# Project Setup & Claude Wiring Notes

### 1. Server Integration (MCP)
Connected `@modelcontextprotocol/server-fetch` to pull external docs/API specifications directly into the session. The permission rule restricts capabilities specifically to `mcp:fetch:fetch` read-only actions to prevent unauthorized network requests.

### 2. Project Skill
Created `express-route` skill. It captures our standard API controller template (error handling, uniform JSON error/success responses). The description triggers automatically on requests matching "add route", "create endpoint", or "build API".

### 3. Custom Command
Added `/review` command (`.claude/commands/review.md`). It automates quick git diff reviews against safety and project standards before committing, saving prompt setup time.

### 4. Hook Configuration
Configured a `PostToolUse` hook on the `Edit` tool inside `.claude/settings.json`. It automatically runs code formatting on modified files immediately after Claude edits them.

### 5. Headless Execution
Ran `claude -p "Review index.js for syntax errors" --allowedTools "View,Edit"`. Locked down access strictly to `View` and `Edit` to safely perform automated checks without giving permission to execute arbitrary terminal commands or network requests.