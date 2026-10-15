# Claude Code wiring notes

## MCP server and permissions

A credential-free filesystem MCP server has been configured at the project level with access restricted to `./docs`. This enables safe reference lookups in the API documentation while working on routes, without exposing the entire codebase to the server. Only specific directory-listing and text-reading tools are permitted in the shared permissions; unrestricted access to all available tools is avoided.

## Project skill

The `api-route` skill encodes the recurring patterns found across this Express API: isolated routers per resource, centralized data operations via `db/store.js`, request validation, uniform HTTP status codes, and standardized error payloads (`{ "error": "message" }`). The skill's description covers both the action and the contexts where it applies—creating new endpoints or modifying route logic—enabling appropriate tool selection without explicit mention.

## Reusable command

The `/review-route <route>` command provides a targeted read-only audit of an individual route. This warrants dedicated support because route modifications consistently require checking the same criteria: input validation, response codes, database interactions, error structure, and test completeness.

## Hook

A project-level `PostToolUse` hook fires after `Write` or `Edit` operations to execute `npm run lint`. This validates code standards right away as files are modified. It runs after the change succeeds rather than blocking it, since linting must operate on the updated file state.

## Headless task

The project's headless validation task runs:

```sh
claude -p "Read docs/api.md and return a five-line endpoint summary. Do not change files." --allowedTools "Read"
```

Read-only access suffices because the operation requires no modifications, shell access, or external calls. This constrained scope—both the focused instruction and the single tool—keeps unattended runs predictable and safe.

## Verification checklist

- `.mcp.json` is well-formed JSON with no embedded secrets.
- The skill's purpose focuses narrowly on API route operations.
- The custom command enforces read-only behavior and handles `$ARGUMENTS`.
- The hook is scoped to the project and triggers on `Write|Edit`.
- The setup's correctness is confirmed by `npm test` and `npm run lint`.