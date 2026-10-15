# Notes

## MCP Server
Connected the `filesystem` server (`@modelcontextprotocol/server-filesystem`), scoped to the project root. It is useful here because it gives Claude a structured, auditable path to read and write files within the project — complementing the built-in tools with an MCP-standard interface other agents can also use. The permission rules allowed `read_file` and `read_multiple_files` without prompting, and denied `delete_file` entirely.

## Skill
The `new-resource` skill captures the project's repeating pattern for adding a CRUD resource: the exact shape of the route file, store helpers, error responses, `server.js` mount, and test file. The description reads "Scaffold a new REST resource following this project's conventions — route file, store helpers, server mount, and tests" so it surfaces when the intent is clearly about adding a new route or resource.

## Custom command
Added `/review-resource`, which checks a named resource's route, store, server mount, and test file against the project's conventions checklist and reports only the failures. It is worth a shortcut because the same review would otherwise require re-reading four files and mentally applying the same checklist every time a route is added or changed.

## Hook
Added a `PreToolUse` hook on the `Bash` matcher that inspects every shell command before it runs and denies any `git push` containing `--force` or `-f`. It prevents rather than reacts — the push is blocked before it executes — and it fires on the `PreToolUse` event, which runs before the tool is invoked.

## Run headless
Running `claude -p "run tests" --allowedTools Bash` executes the test suite non-interactively. Only `Bash` was allowed because `npm test` is a single shell command — no file reads, writes, or web fetches are required. Restricting to `Bash` means Claude cannot inspect or modify any source files during the run, keeping the headless invocation safe to use in CI or as a one-off check.
