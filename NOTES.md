# Notes

## MCP Server Choices
Connected the filesystem MCP server at project scope to allow secure, structured directory exploration. Restricted permissions to read-only operations to ensure safety.

## Skill Choices
Captured the project's repeated pattern for writing Express routes, input validation, and JSON error formatting. Wording targets route creation and modification requests directly.

## Command Choices
Added the `/review-code` custom command to quickly audit code against architectural conventions without re-typing long prompts.

## Hook Choices
Configured a PostToolUse hook on the Write tool to automatically run `npm run lint` after any file modification, enforcing code style standards continuously.

## Headless Execution
Ran a scoped task using `claude -p` with `--allowedTools Read,Grep` to safely inspect the codebase without interactive supervision.