# Notes

## The server

Connected the `@modelcontextprotocol/server-filesystem` package, scoped to `docs/` only, as the `docs` MCP server in `.mcp.json`. It's useful here because `docs/api.md` is the canonical API reference for this project — giving Claude read access to it (without giving it the run of the whole repo) means it can answer "what does this endpoint return" or "does this match the documented contract" without me pasting the file in every time.

The permission rule in `.claude/settings.json` allows only `mcp__docs__read_text_file` and `mcp__docs__list_directory` — the two tools I actually used — rather than blanket-allowing the server. `write_file`, `edit_file`, `move_file`, and `create_directory` are all left unapproved, so the server can be read from but not written through.

One real bug found while testing: the args array originally used `${CLAUDE_PROJECT_DIR}/docs`, which produced a `CONNECTION_CLOSED` error — the variable wasn't being resolved before the server started, so it got a literal, nonexistent path. Switched to a plain relative `./docs`, confirmed via a headless run that both `list_directory` and `read_text_file` connect and return real content from `docs/api.md`.

## The skill

`.claude/skills/add-express-route/SKILL.md` encodes how a route gets written in this project: store helper first, then the route handler, then validation (`400`/`404` with `{ "error": "message" }`), then a test using `node:test` + `supertest` with `store.reset()` in `beforeEach`. This is the pattern `routes/users.js` and `db/store.js` already follow — the skill just writes it down so it doesn't need re-explaining every time a route gets added.

Confirmed it fires: ran a headless task with the prompt "Add a DELETE endpoint for /users/:id" — never naming the skill — and the transcript shows `Launching skill: add-express-route` before any file was touched.

## The command

`.claude/commands/review-conventions.md` — a `/review-conventions` command that diffs the working tree against the four rules in `CLAUDE.md` (route-per-resource, store-only data access, `400`/`404`, JSON error shape) and reports violations with a suggested fix. Takes an optional `$ARGUMENTS` to narrow the focus area. This is the "review my diff before I open a PR" prompt I'd otherwise retype every time.

Tested it against a deliberately broken handler (`res.status(500).send('something went wrong')` — plain text, not JSON) added temporarily to `routes/health.js`. The command correctly flagged the exact line, quoted the violated convention, and proposed the JSON-shaped fix; it also correctly did *not* flag unrelated non-issues (no new mount needed, no store access expected). Reverted the test violation before committing.

## The hook

A `PostToolUse` hook on the `Edit|Write` matcher, running `npm run lint`, at project scope in `.claude/settings.json`. It reacts (rather than prevents) because linting is a "catch it right after" concern, not something that needs to block the edit itself. `PostToolUse` also has a fully-written file to lint, whereas `PreToolUse` would only see the proposed change.

Confirmed it fires: a clean `npm run lint` produces no output worth surfacing in the transcript, so first-pass evidence was ambiguous. To get an unambiguous signal, I swapped the command for one that also appends to a log file, ran a single headless edit, and watched the log file appear with the expected content — then restored the hook to the plain `npm run lint` before committing anything.

## The headless task

Ran `claude -p "Add a DELETE endpoint for /users/:id to this project."` with `--allowedTools "Read,Edit,Write,Glob,Grep,Skill"` — deliberately leaving out `Bash` and `PowerShell`. The task needed to read and edit three files; it didn't need to run anything. That paid off: the run tried `npm test` three times (once chained, twice standalone) and was denied every time since neither shell tool was on the allow-list, so it stopped and reported its changes rather than silently declaring success. I ran `npm test` (8/8 passing) and `npm run lint` (clean) myself afterward, reviewed the diff, and committed it — the same review step I'd give a human's PR.
