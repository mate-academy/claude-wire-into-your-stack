# Project 3 Notes

## 1. Server (MCP)

I connected two servers in `.mcp.json`: **`fetch`** (via `uvx mcp-server-fetch`) and **`memory`** (via `npx @modelcontextprotocol/server-memory`).

The `fetch` server is useful here because it lets Claude pull live API references and docs during development — for example, fetching Express or Node.js documentation without leaving the session. No credentials required. The permission rule in `.claude/settings.local.json` explicitly allows `mcp__fetch__fetch` (and `mcp__memory__read_graph`) rather than blanket-allowing every tool the servers expose, keeping the surface area small.

The `memory` server persists project context across sessions — architectural decisions, conventions, and who did what — so Claude arrives with background knowledge rather than starting cold every conversation.

## 2. Skill

The skill I encoded is **`route-convention-check`**, defined in `.claude/skills/route-convention-check/SKILL.md`.

This project has a clear, repeated pattern every time a route is added or modified: check that auth middleware is applied correctly, that `:id` params are parsed through `lib/parseId.js`, that error responses follow `{ "error": "message" }` with the right status codes, and that data access goes only through `db/store.js`. Without a skill these checks get forgotten under time pressure.

The description reads: *"Verify that a newly added or modified route follows project conventions. Use when a route handler is added or changed in routes/."* The phrase "route handler is added or changed in routes/" is specific enough to fire on route work and nothing else — it won't trigger on, say, a test refactor or a database change.

## 3. Command

I added a **`/test`** command in `.claude/commands/test.md`.

It runs `npm test` and returns a structured summary: total tests, pass/fail count, and — on failure — the exact test name and assertion error. Running tests is the most frequent development action on this repo (every change needs a green suite before committing), and having a consistent report format means the output is always scannable rather than raw runner noise.

## 4. Hook

The hook is set in `.claude/settings.local.json` on the **`UserPromptSubmit`** event.

It **reacts** (does not prevent) — it fires after the user submits a prompt but before Claude responds, echoing a reminder to call `mcp__memory__read_graph` if it hasn't been called yet this session. This ensures Claude always loads project context from the memory graph before answering, rather than starting from a blank slate. The event choice is deliberate: `UserPromptSubmit` is the earliest point where context injection matters; using `PostToolUse` would be too late in the turn.

## 5. Headless run

I ran the memory initialization task headless: seeding the knowledge graph with initial project entities (architecture, conventions, commands) so the memory MCP has baseline context from day one.

The `--allowedTools` was locked down to just `mcp__memory__create_entities` and `mcp__memory__read_graph` — the minimum needed to read the existing graph and write new entities. No file editing, no bash, no fetch. This mirrors the principle from the course: pre-approve only what the task provably needs, so an autonomous run can't drift into unintended side effects.
