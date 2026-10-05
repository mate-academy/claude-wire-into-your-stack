# Claude Wiring Notes

## MCP server

I connected the Fetch MCP server because it allows Claude to retrieve
external documentation and API references while working on the project.

The permission rule allows only:

`mcp__fetch__fetch`

This keeps the MCP permission scoped to the read-only fetch operation
rather than allowing every possible MCP capability.

## Skill

I created the `create-route` skill.

It captures the project's repeated Express route conventions:
separate route files, mounting routes in `server.js`, using `db/store.js`
for data access, validating input, returning 400/404 responses, and using
the project's JSON error format.

The description mentions creating and modifying Express routes so the
skill can trigger when those tasks are requested.

## Command

I created `/review`.

It provides a repeatable checklist for reviewing the current changes
against the project's route, validation, error handling, testing, and
linting conventions.

## Hook

I added a `PostToolUse` hook for `Edit|Write`.

After Claude edits a file, the hook runs `npm run lint`. This provides
an automatic project-level quality check after edits.

## Headless task

I ran a small read-only review using `claude -p` with:

`Read`, `Glob`, and `Grep`

Only those tools were allowed because the task only required inspecting
the repository and did not require editing files or running commands.