# NOTES — Wiring Claude into this project

## 1. Server (MCP): `fetch`

I connected the reference **fetch** server (`uvx mcp-server-fetch`) at project scope in `.mcp.json`. It's credential-free and genuinely useful here: this repo leans on Express and supertest, and the fetch server lets Claude pull the real upstream docs/READMEs instead of guessing API behaviour. Two deliberate details:

- The args pin `--with "mcp<2"` because the current `mcp-server-fetch` release breaks against the `mcp` 2.x Python SDK (`McpError` was renamed) — without the pin the server fails to start on a fresh machine.
- The permission rule in `.claude/settings.json` allows only `mcp__fetch__fetch` (the server's single read-only tool) rather than blanket-allowing the server, and `enableAllProjectMcpServers: true` means a teammate's clone connects it without a manual approval step.

Used once for real: asked Claude (headless) to fetch the supertest README and confirm what `request(app)` does when the app isn't listening — answered from the fetched page via `mcp__fetch__fetch`.

## 2. Skill: `add-resource-route`

The way of working this project repeats is **how an endpoint is added**: one route file per resource mounted in `server.js`, all data access through `db/store.js`, `Number(req.params.id)` conversion, `400`/`404` validation with errors of exactly the shape `{ "error": "message" }`, supertest tests that start with `store.reset()`, and a `docs/api.md` entry. The description is worded around the *user's request* ("adding a new route, resource, or HTTP method (GET/POST/PUT/DELETE) to the Express API") rather than around the solution, so it fires on the right ask and nothing else.

Confirmed: prompted "Add a DELETE /users/:id endpoint to this API" **without naming the skill** — Claude invoked `add-resource-route` on its own, touched exactly route + store + tests + docs, and all 7 tests passed. (Change reverted afterwards; this PR is wiring only.)

## 3. Command: `/route-review`

`.claude/commands/route-review.md` reviews a route file (via `$ARGUMENTS`, defaulting to all of `routes/`) against an 8-point checklist of the conventions above, reporting PASS/FAIL with line numbers and a merge verdict. Worth a shortcut because it's the prompt you'd run before every PR on this repo — and the checklist stays consistent instead of being retyped from memory. First run immediately paid off: it found three missing test cases (GET /users/:id success, POST 400, PUT 400).

## 4. Hook: lint that always holds

`PostToolUse` on `Edit|Write` runs `node .claude/hooks/lint-fix.js` — it **reacts** after every file Claude edits or writes. The script (Node, so it works on Windows and Unix alike) runs ESLint `--fix` on the touched `.js` file; if unfixable errors remain it exits `2` with the ESLint report on stderr, which feeds the errors straight back to Claude to fix. So it's reactive (auto-format) with a preventive edge (bad code doesn't slide through silently). Verified by piping a synthetic payload for a file containing a `no-undef` error: hook exits 2 and prints the report; clean files and non-JS files pass through with exit 0.

## 5. Headless run

Ran `claude -p "/route-review routes/users.js" --allowedTools "Read,Grep,Glob"` — a review is the ideal unattended task because it needs no write access at all. The allowlist grants exactly the three read-only tools the checklist needs (read files, search, glob) and nothing else: no Edit/Write, no Bash, no network. The MCP verification run was equally scoped: `--allowedTools "mcp__fetch__fetch"` only.
