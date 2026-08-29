# Wiring Claude into the Course API

## Server: Fetch MCP

**Server chosen:** `@anthropic-ai/fetch-mcp` (fetch server)

**Why it's useful:** The API project needs to pull external documentation, API references, and JSON payloads during development. The fetch server allows Claude to retrieve data from external sources while working on routes, testing payloads, and verifying API contracts.

**Permission rule:** Limited to the `fetch` tool only. This prevents other potentially risky MCP tools from being available, scoping access to read-only HTTP requests.

## Skill: Add a new route

**Pattern captured:** How Express routes are written in this project. All routes follow the same pattern:
- Use Express Router in `routes/<resource>.js`
- Validate input, return 400 on bad input
- Return 404 with error JSON when records are missing
- All data access goes through `db/store.js`
- Responses are JSON with proper status codes (201 for POST, 200 for GET/PUT)

**Description wording:** The skill triggers when the user asks to "add a new endpoint," "create a new route," or "add a new resource route." This is specific enough to fire only on route-creation tasks, not general code questions.

**Confirmation:** Tested by asking Claude to add a new route endpoint without naming the skill — it triggered automatically and applied the template correctly.

## Command: /test-and-lint

**Command:** Runs `npm test && npm run lint`

**Why it's useful:** Before committing any changes, both the test suite and linter must pass. This command combines both checks into one reusable shortcut, ensuring code meets the project's standards in one go rather than running two separate commands.

**Confirmation:** Ran the command and verified both npm test and npm run lint executed successfully with no failures.

## Hook: Auto-lint after edits

**Event:** `PostToolUse` — reacts after edits, doesn't prevent them

**Matcher:** Watches the `Edit` tool specifically

**Command:** `npm run lint`

**Why this helps:** Enforces the project's linting standard automatically. Every time code is edited, ESLint runs immediately, catching style issues early rather than at commit time. This keeps the codebase clean without requiring manual intervention.

**Confirmation:** Manually edited a file in the project, and the hook triggered, running ESLint automatically afterward.

## Headless task: Run the full test suite

**Task:** `npm test` with `--allowedTools Bash`

**What was locked down:** Only Bash tool allowed, preventing accidental file edits, external API calls, or other risky operations. The test runner is read-only and safe to run unsupervised.

**Why this works:** The test suite has no external dependencies beyond the project code and npm packages. It runs entirely locally, validates correctness, and produces clear pass/fail output without requiring human decisions.

**Run:** `claude -p --allowedTools Bash npm test`
