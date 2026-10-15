# NOTES

## Server

Connected the official `fetch` MCP server (`uvx mcp-server-fetch`, Anthropic's reference implementation — credential-free). It's useful here because this project's work often involves checking Express/Node/ESLint behavior while writing or reviewing a route, and this lets Claude pull that reference material directly instead of relying on memory or pasted snippets. The permission rule allows only `mcp__fetch__fetch` — the single tool the server exposes — rather than blanket-trusting the server, so it can only fetch and read pages, nothing else. Verified it works by driving it directly over stdio and fetching `expressjs.com`'s API docs, which came back as clean markdown.

## Skill

`doc-sync` (`.claude/skills/doc-sync/SKILL.md`) captures a repeated failure mode in this repo: `routes/`, `docs/api.md`, and `tests/` all describe the same endpoint but nothing forces them to stay in sync when one changes. The description names the concrete triggers — "adding, removing, or changing an endpoint in `routes/*.js` (new route, changed validation, changed status codes, changed request/response shape)" — so it fires on route work specifically, not on unrelated edits. Confirmed it fires: a fresh agent, given only "add email validation to `POST /users`, return 400" with no mention of the skill, found `.claude/skills/doc-sync/SKILL.md` on its own and updated `docs/api.md` and `tests/users.test.js` to match, exactly per the skill's steps.

## Command

`/route-check` (`.claude/commands/route-check.md`) cross-checks every route in `routes/*.js` against its `docs/api.md` section and its test cases, reporting drift in either direction. It's report-only — it never edits files — because checking for drift and fixing it are different moments (fixing is what the `doc-sync` skill is for). It earns its keep because this is exactly the kind of check that's easy to skip by hand after a change: running it surfaced real, pre-existing gaps (missing tests for `GET /users/:id`'s success path, `POST /users`'s 400 case, `PUT /users/:id`'s 400 case, and no tests at all for `GET /health`) even though `docs/api.md` itself was fully accurate.

## Hook

A `PostToolUse` hook on the `Edit|Write` matcher, set in `.claude/settings.json`. It reacts rather than prevents: after any edit/write, it checks whether the touched file is `.js`, and if so runs `npm run lint`. A real lint error (e.g. `no-undef`) makes it exit 2 with the ESLint output attached, so Claude sees the failure and can fix it; a warning-level issue (like `no-unused-vars`, which this project's `eslint.config.js` deliberately downgrades to `warn`) doesn't block, matching `npm run lint`'s own exit-code behavior. Chose `PostToolUse` + react over `PreToolUse` + prevent because linting needs the file to already be written to check it.

## Headless run

Ran the same route/doc/test sync analysis as `/route-check` via `claude -p`, scoped to `--allowedTools "Read,Glob,Grep"` — no `Bash`, `Edit`, `Write`, or `Agent`. That set was locked down specifically because the task is pure analysis: it needs to read files and search across them, but has no legitimate reason to run a command or touch a file, so those tools were left out entirely rather than allowed and just not used. It reproduced the same findings as the manual run, and `git status` confirmed nothing was changed.
