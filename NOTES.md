# Implementation Notes

## MCP server
I configured the Filesystem MCP server at project scope in `.mcp.json`, restricted to the `docs/` directory. It is useful for reading the project's API documentation. The permission rules allow only directory listing, directory tree inspection, and file reading. I verified that the server starts successfully over stdio.

## Skill
I added the `express-route` project skill. It documents the project's conventions for Express routers, data access through `db/store.js`, input validation, JSON error responses, API documentation, and tests. Its description targets requests to create or modify API routes.

## Custom command
I added the `/review-api` command to review API changes against the project's conventions, validation rules, HTTP status codes, documentation, and tests. It accepts optional `$ARGUMENTS` and is instructed not to modify files.

## Hook
I configured a `PostToolUse` hook matching `Write|Edit`. It runs ESLint after file edits to help maintain the project's code quality.

## Headless task
I ran a read-only API review using GitHub Copilot CLI in non-interactive mode (`-p`). I restricted available tools to `view`, `grep`, and `glob`, allowed read access, and denied write, shell, and URL access. The review identified issues with invalid ID handling, field validation, error handling, and test coverage. This was performed with Copilot CLI as an alternative; the required Claude Code `claude -p` run was not performed.
