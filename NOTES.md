# Project Wiring & Configuration Notes

### 1. Server (MCP)
- **Server Connected**: `@modelcontextprotocol/server-fetch` via `.mcp.json`.
- **Usefulness**: Allows Claude to fetch external API documentation and specifications directly into the session when expanding API routes.
- **Permissions**: Restricted to read-only fetching via `mcp:fetch/fetch` to prevent unauthorized execution.

### 2. Project Skill
- **Captured Workflow**: Standardized design pattern for writing Express API routes (error formatting, input validation, and async handling).
- **Trigger Strategy**: The description is explicitly scoped to fire whenever a user asks to create, modify, or extend an Express route or endpoint in this project.

### 3. Custom Command
- **Command Added**: `/code-review` (`.claude/commands/code-review.md`).
- **Why it's useful**: Automates the checklist review process before making commits or opening Pull Requests, taking optional arguments (`$ARGUMENTS`) for target files.

### 4. Hook Standard
- **Hook Type & Event**: `PostToolUse` reactive hook on `WriteFile` and `EditFile` tools in `.claude/settings.json`.
- **Behavior**: Automatically runs `npm test` whenever code edits are made to immediately signal regression issues.

### 5. Headless Execution
- **Task Run**: `claude -p "Review the project structure and run npm test to ensure everything passes" --allowedTools "Bash,ReadFile"`
- **Scope Justification**: Pre-approved only `Bash` (for test execution) and `ReadFile` (for code inspection) so Claude could run the task headless safely without modifying files or accessing external systems.
