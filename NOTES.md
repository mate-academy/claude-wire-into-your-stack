# Notes

## MCP server

The fetch server (`@modelcontextprotocol/server-fetch`) was connected at project scope via `.mcp.json`. It is useful here because the API's documentation and any external references can be fetched without leaving the coding context — useful for looking up specs or checking example payloads mid-task. The permission rule in `.claude/settings.json` allows only `mcp__fetch__fetch`, scoping access to the read-only fetch tool and blocking any other tools the server might expose.

## Skill

The `add-resource` skill captures the repeated work of scaffolding a new REST resource: creating a route file, adding store functions, writing tests, and mounting the router in `server.js`. Without a skill, each new resource requires the same sequence of steps across four files with nothing to enforce consistency. The description was written to name the concrete action ("add a new REST resource") and reference the project's own patterns, so the model resolves it when asked to add a product, order, or any new entity.

## Custom command

The `/review-route` command runs a structured checklist against a route file — error shape, status codes, early returns, store alignment, and test coverage — and returns a one-line verdict. It is worth a shortcut because the same checklist applies to every route in the project, the review is mechanical enough to automate, and running it before a commit catches convention drift that is easy to miss in a quick read.

## Hook

A `PostToolUse` hook was added to `.claude/settings.json` that runs `eslint --fix` after every `Write` or `Edit` to a `.js` file. It reacts rather than prevents: the edit lands first, then ESLint cleans up any fixable style issues automatically. The event is `PostToolUse` with matcher `Write|Edit`, so it fires after file writes regardless of which route or store file was touched.

## Headless run

`claude -p` was used to add the `DELETE /users/:id` route and its `deleteUser` store function. The `--allowedTools` flag was set to `Read,Edit,Bash(npm test)`, which locked the subprocess to reading files, making edits, and running the test suite — nothing else. That constraint meant the task could not install packages, run git, start the server, or take any action outside the narrow scope of implementing and verifying the feature.
