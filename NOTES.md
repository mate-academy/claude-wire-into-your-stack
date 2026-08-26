# Claude Wiring Notes

## MCP server

I connected the credential-free fetch MCP server at project scope in `.mcp.json`. It is useful for retrieving external API documentation while working on this Express API. The permission rule allows only the fetch MCP tool rather than granting blanket access to the server.

## Skill

The `api-routes` skill captures the project's repeated Express route conventions: validation belongs in the route, data access belongs in `db/store.js`, missing records return 404, invalid input returns 400, and errors use the project's JSON shape. The description is specific to creating or modifying Express API routes so it can trigger for that kind of request without being relevant to unrelated work.

## Command

The `api-review` command provides a reusable review against the project's API conventions. It is useful because the same validation, error handling, and data-access rules apply whenever an endpoint is changed.

## Hook

The project uses a `PostToolUse` hook for `Edit` and `Write`. After Claude edits a file, it runs the project's existing ESLint command. This makes linting an automatic quality check after changes rather than relying on someone to remember to run it manually.

## Headless run

The headless task is limited to inspecting the API route and project files and reviewing the implementation. The `--allowedTools` list is intentionally scoped to read-only tools needed for that review, avoiding broad write or shell permissions.
