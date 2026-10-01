\# Project 3 Notes



\## MCP server



I connected the Fetch MCP server at project scope because it is useful for retrieving external API and framework documentation while working on this Express project. It is credential-free, so no secret or API key is stored in the repository.



The MCP configuration is committed in `.mcp.json`. I allowed only the read-only Fetch tool, `mcp\_\_fetch\_\_fetch`, rather than granting blanket access to all MCP tools. This keeps the server permission limited to the capability actually needed.



I tested the server by using it to retrieve Express routing documentation and confirm that it worked from the project.



\## Project skill



I added the `express-route-conventions` project skill under `.claude/skills/express-route-conventions/SKILL.md`.



The skill captures the repeated conventions used when adding, modifying, fixing, or reviewing user routes in this repository. It covers route structure, access through `db/store.js`, input validation, HTTP status codes, error-response format, tests, documentation, and coding style.



I wrote the description specifically so it should trigger for user-route work and related store, test, or API documentation changes, rather than unrelated tasks.



I tested it by asking Claude how it would handle a user-route request without naming the skill directly. Claude followed the repository-specific conventions encoded by the skill.



\## Custom command



I added the `/review-route` custom command in `.claude/commands/review-route.md`.



The command performs a repeatable review of the user-route implementation against the project's established conventions. It checks route structure, store usage, validation, HTTP status codes, response formats, tests, documentation, coding style, and stale course-history comments.



This is worth a shortcut because the same review checklist can be reused after future route changes without rewriting the full prompt each time.



\## Hook



I added a project-scoped `PostToolUse` hook in `.claude/settings.json`.



The hook reacts after Claude uses an Edit or Write operation. Its matcher is limited to `Edit|Write`, and it runs:



`npm run lint`



I chose a reactive lint hook because this repository already has an ESLint script but does not have a formatter script. The hook automatically checks the project after Claude changes a file and helps catch problems immediately.



I deliberately triggered the hook with a harmless documentation edit and confirmed that the lint command ran afterward.



\## Headless task



I ran a headless review using `claude -p` to inspect `routes/users.js` and `db/store.js` against the project's user-route conventions.



I allowed only the `Read` tool with `--allowedTools "Read"` because the task required repository inspection but did not need file edits, shell commands, Git operations, or external services.



The task completed successfully as a read-only review without modifying any files.

