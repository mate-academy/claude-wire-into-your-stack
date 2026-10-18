# Integration Notes

This file records the Claude Code integration choices made for the Course API project.

## 1. MCP server

The Fetch MCP server is configured in `.mcp.json` so Claude can retrieve web content (documentation pages, references) during a session without leaving the workflow.

- Server name: `fetch`, transport `stdio`
- Launched with `uvx mcp-server-fetch`
- The `command` is currently an absolute Windows path to `uvx.exe`:

```json
{
  "mcpServers": {
    "fetch": {
      "type": "stdio",
      "command": "C:\\Users\\peeyu\\AppData\\Local\\Microsoft\\WinGet\\Links\\uvx.exe",
      "args": ["mcp-server-fetch"]
    }
  }
}
```

The server is approved for use through `enabledMcpjsonServers: ["fetch"]` in `.claude/settings.local.json`.

## 2. Skill

`.claude/skills/api-route/SKILL.md` defines the `api-route` skill, which captures how API routes should be built in this repository.

Use it when implementing, updating, or reviewing Express routes, especially endpoints that touch the user data store or need tests. It tells Claude to:

- read `CLAUDE.md`, `docs/api.md`, and the existing route files first
- follow the Express 4 / CommonJS conventions already in use
- verify what `db/store.js` actually provides before calling it
- validate input and return the documented status codes and JSON shapes
- add tests with the existing test framework, run them, and report real results
- keep changes focused on the requested endpoint

## 3. Custom command

`/check-api` is defined in `.claude/commands/check-api.md`. It performs a read-only review of the API:

1. Reads `CLAUDE.md` and `docs/api.md`.
2. Inspects the route files and `db/store.js`.
3. Reviews the existing tests for correctness and coverage.
4. Looks for bugs, missing validation, wrong HTTP status codes, and gaps between the implementation and the documented contract.
5. Reports findings in priority order with file and line references, or says clearly that there are none.

The command explicitly forbids editing, creating, or deleting files, and forbids claiming tests passed unless they were actually run.

## 4. Hook

`.claude/settings.json` defines a `PostToolUse` hook:

- Event: `PostToolUse`
- Matcher: `Write|Edit` (fires after Claude writes or edits a file)
- Command: `echo 'Claude modified a file in this project.'`

Execution was tested successfully. During testing the command was temporarily changed to `echo hook-ran >> .claude/hook-test.log`. Writing a file made the hook append `hook-ran` to the log, confirming it fires. The command was then restored to the echo message above and the temporary test files were removed.

## 5. Permissions

`.claude/settings.json` allows:

```json
"permissions": {
  "allow": ["Read(./**)", "Glob", "Grep"]
}
```

- `Read(./**)` lets Claude read any file inside the project.
- `Glob` and `Grep` let it find files and search their contents.

These are all read-only. No `Write`, `Edit`, or `Bash` permissions were added, so any change to files or any shell command still requires explicit approval.

## 6. Headless run

Successful command used to summarize the API documentation non-interactively, with only that one file readable:

```
claude -p "Read docs/api.md and summarize the documented API endpoints, including their HTTP methods and purposes. Do not modify any files." --allowedTools "Read(./docs/api.md)"
```

It summarized five endpoints (`GET /health`, `GET /users`, `GET /users/:id`, `POST /users`, `PUT /users/:id`) and modified no files.

## 7. Limitations

- The `uvx.exe` path in `.mcp.json` is an absolute, machine-specific Windows path. On another computer it will need adjusting (for example to the local `uvx` location, or plain `uvx` if it is on `PATH`).
- Application tests (`npm test`) have not been run as part of this integration work, so no claim is made about their results.
