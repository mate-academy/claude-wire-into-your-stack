# Claude Project Wiring Notes

## MCP server

Connected the `project-docs` filesystem MCP server at project scope through `.mcp.json`.

It is useful because the repository contains API documentation in `docs/api.md`, which Claude can read through MCP. The server is scoped to the `./docs` directory.

The project permission rule allows the read-only MCP tool:
`mcp__project-docs__read_text_file`

The server was tested by asking Claude to read and summarize `docs/api.md`.

## Skill

Created the `express-route` project skill in `.claude/skills/express-route/SKILL.md`.

The skill captures the project's repeated conventions for Express routes: route structure, use of `db/store.js`, request validation, HTTP status codes, JSON error responses, and tests.

The description is written to trigger when creating or modifying Express API routes, endpoints, validation, error handling, or related tests.

The skill was tested with a request about adding a new `DELETE /users/:id` endpoint without explicitly naming the skill.

## Command

Created the `/review` custom command in `.claude/commands/review.md`.

It provides a reusable code-review checklist for the Express API and accepts additional input through `${ARGUMENTS}`.

It was tested with:
`/review Focus on the users API routes and their tests`

The command reviewed the repository without modifying files.

## Hook

Configured a project-level `PostToolUse` hook in `.claude/settings.json`.

The hook watches `Edit` and `Write` operations and runs:

`npm run lint`

This reacts after file changes and enforces the project's linting standard automatically.

## Headless task

Ran one task using Claude Code in headless mode with `claude -p`.

The task reviewed `CLAUDE.md` and `routes/users.js` without modifying files.

Only the `Read` tool was allowed through `--allowedTools`, because the task only required reading and analysis. Write and shell tools were not granted.
