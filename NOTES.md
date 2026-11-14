# Project 3 — Wiring Claude into the Course API

Everything below is committed, so anyone who clones this branch gets the same Claude setup.
(First run: accept the workspace-trust prompt and approve the `fetch` server from `.mcp.json`;
project permissions and hooks only load in a trusted workspace. Run `npm install` so the hook can find ESLint. The fetch server needs `uv`/`uvx` installed.)

## 1. Server — `fetch` (`.mcp.json`, project scope)
I connected the official **fetch** MCP server (`uvx mcp-server-fetch`). It needs no credentials, so there is nothing secret in `.mcp.json`. It's useful here because this is an Express app: Claude can pull the Express API reference, changelog or a package README straight into the session instead of guessing from memory.
**Permission rule:** `.claude/settings.json` → `permissions.allow: ["mcp__fetch__fetch"]`. That allows only the server's single read-only `fetch` tool, by exact name, rather than blanket-allowing `mcp__fetch`. `enabledMcpjsonServers: ["fetch"]` names the one server the project expects.
**Used it:** I had Claude fetch Express's 4.x `History.md` and check whether recent releases affect our `res.status()/res.json()` usage in `routes/users.js`. Its answer: latest is 4.22.3, nothing affects our usage.

## 2. Skill — `express-route` (`.claude/skills/express-route/SKILL.md`)
**What it captures:** the way every endpoint in this repo is built: data access only through `db/store.js`, one router per resource mounted in `server.js`, `400`/`404`/`201`/`204` status codes, errors always `{ "error": "message" }`, a `node:test` + supertest test covering the error cases, and a `docs/api.md` entry.
**Description wording:** it starts with the trigger ("Use when adding, changing, or testing an HTTP endpoint in this Express API (a route under routes/ …)"), gives example requests, and ends with what it is *not* for (README, lint config, CI) so it doesn't fire on unrelated edits.
**Confirmed:** I asked "Add a DELETE /users/:id endpoint to the API." without naming the skill. Claude's first action was `Skill: express-route`, and it then added the store helper, route, two tests and the docs entry, with lint and tests passing.

## 3. Command — `/review` (`.claude/commands/review.md`)
**What it does:** reviews the branch's diff against `main` (plus uncommitted work) using the project's checklist, runs `npm run lint` and `npm test`, and replies with a Ready / Needs changes verdict, ✅/❌ per item with file:line, and fixes. `$ARGUMENTS` optionally narrows the focus (e.g. `/review routes/users.js`). Its `allowed-tools` frontmatter limits it to git read commands, lint, test and file reads, and it is told not to edit anything.
**Why it's worth a shortcut:** I'd run this before every PR. Saving it means the checklist is the same every time and for every teammate, instead of a prompt retyped from memory.
**Ran it:** `/review routes/users.js` on a branch with the new DELETE route. It ran the diff, lint and tests and returned "Verdict: Ready" with each checklist item ticked and line references.

## 4. Hook — lint after every edit (`.claude/settings.json` → `.claude/hooks/lint-on-edit.js`)
**Reacts, on `PostToolUse`**, matcher `Edit|Write|MultiEdit`. The command runs `node .claude/hooks/lint-on-edit.js`, which reads the edited file path from the hook's JSON input and, for `.js` files in the repo, runs `eslint --fix` on just that file. If problems remain it exits `2`, so the ESLint output goes back to Claude to fix right away. That's the same `npm run lint` gate CI enforces, held on every edit rather than discovered at PR time. Non-JS files and files outside the repo are skipped. It's written in Node so it works for anyone who can run the project, with no `jq` needed.
**Triggered it:** while Claude added the DELETE route, the hook printed `lint-on-edit: routes/users.js is clean` after each edit. Then I deliberately had Claude write `routes/ping.js` containing `module.exports = pingRouter;`. The hook fired and returned `'pingRouter' is not defined (no-undef)`, and Claude reported the lint failure.

## 5. Headless run
```bash
claude -p "Compare docs/api.md against the routes in routes/ and server.js. List any endpoint, status code or error message that is documented but not implemented, or implemented but not documented. Do not change any files." \
  --allowedTools "Read,Grep,Glob"
```
**Allowed:** only `Read`, `Grep` and `Glob`, which is all a docs-vs-code audit needs.
**Locked down:** in `-p` mode anything not pre-approved is denied, so there's no `Bash`, `Edit`/`Write`, network or MCP access. It can't change the repo, run commands or reach the internet with nobody watching.
**Result:** finished in 7 turns with 0 permission denials. All five endpoints and their status codes match the docs. It found that the exact error messages aren't documented, that unknown paths and malformed JSON return Express's HTML errors (not JSON), and that non-numeric ids return `404` rather than `400`. These are good candidates for a future change.
