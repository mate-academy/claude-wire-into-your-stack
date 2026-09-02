# Claude Code wiring notes

## MCP server and permissions

I connected the credential-free filesystem MCP server at project scope and limited it to `./docs`. It is useful for reading the API reference while working on routes without giving the server access to the rest of the repository. Shared permissions allow only its directory-listing and text-reading tools; they do not blanket-allow every tool the server could expose.

## Project skill

The `api-route` skill captures the route conventions that repeat throughout this Express API: one router per resource, data access through `db/store.js`, input validation, consistent status codes, and `{ "error": "message" }` errors. Its description includes both the task and the triggering situations (adding an endpoint or changing route behavior), so Claude can select it without the skill being named explicitly.

## Reusable command

`/review-route <route>` performs a focused read-only review of one route. This is worth a shortcut because the same validation, status-code, data-access, error-shape, and test-coverage checklist applies to every route change.

## Hook

The project-scoped `PostToolUse` hook reacts after `Write` or `Edit` and runs `npm run lint`. It checks the repository standard immediately after a file change. This belongs after the edit because linting reports on the new file contents; it is not intended to prevent the edit itself.

## Headless task

The scoped headless check for this setup is:

```sh
claude -p "Read docs/api.md and return a five-line endpoint summary. Do not change files." --allowedTools "Read"
```

Only `Read` is pre-approved because the task needs no edits, shell commands, or network access. The narrow prompt and tool set make the unattended run deterministic and low risk.

## Verification checklist

- `.mcp.json` is valid JSON and contains no credentials.
- The skill description is specific to API route work.
- The command is read-only and accepts `$ARGUMENTS`.
- The hook is project-scoped and watches `Write|Edit`.
- The application remains verified with `npm test` and `npm run lint`.
