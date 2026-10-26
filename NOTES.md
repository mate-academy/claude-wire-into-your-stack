# Wiring Claude into the Course API

## 1. Server (MCP): `docs` — filesystem server on `docs/`

`.mcp.json` registers `@modelcontextprotocol/server-filesystem` (pinned version) at project scope, rooted at `./docs` only.
It is credential-free, runs on Node (which every contributor already has for this repo), and gives Claude a direct
view of the API reference (`docs/api.md`) so it can check routes against the documented contract.

The permission rule in `.claude/settings.json` allows only the read-only tools we actually use —
`read_text_file`, `read_multiple_files`, `list_directory`, `search_files` — and explicitly denies the writing ones
(`write_file`, `edit_file`, `move_file`, `create_directory`). Docs changes go through normal, reviewable edits, not the server.
`enabledMcpjsonServers: ["docs"]` means a fresh checkout doesn't have to approve the server by hand.
I used it in the headless run below to compare `docs/api.md` with `routes/`.

## 2. Skill: `api-endpoint`

Every change to this API repeats the same steps: add a helper to `db/store.js`, write the handler in `routes/<resource>.js`,
validate input → `400`, missing record → `404`, errors as `{ "error": "message" }`, tests with `node:test` + `supertest`,
then a `docs/api.md` entry. The skill writes those steps down.

The description names the trigger in the words people actually use ("add, create, implement or modify an API endpoint,
route or resource", with examples like "DELETE/PATCH on /users"). It also says what it is *not* for (README, CI, tooling),
so it doesn't fire on unrelated edits. To check it, I asked "Add a DELETE /users/:id endpoint" without naming the skill, and Claude loaded `api-endpoint`.

## 3. Command: `/review-changes [base]`

A pre-PR review of the branch against the CLAUDE.md checklist (route-per-resource, store-only data access, 400/404,
error shape, tests, docs, no secrets), plus `npm run lint` and `npm test`, reported as a pass/fail table with a verdict.
It's the thing I'd otherwise type before every PR. `$ARGUMENTS` is an optional base ref (defaults to `main`), and
`allowed-tools` limits it to read-only git commands, lint, and tests, and it never edits files.

## 4. Hook: PreToolUse guard on `Bash` (prevents)

Event **PreToolUse**, because the goal is to stop damage before it happens, not to clean up afterwards. Matcher **`Bash`**, because
that's the only tool that can run these commands. Command: `node .claude/hooks/block-risky-bash.js`, which is Node so it
works the same on Windows, macOS and Linux. It exits `2` (blocking) on `rm -rf`, force pushes, pushes straight to
`main`/`master`, `git reset --hard`, and `git clean -f`, and the reason goes back to Claude. I triggered it on purpose: a test
loop containing `rm -rf` was blocked before it ran, while `npm test` and `git push -u origin <branch>` passed.

## 5. Headless run

```bash
claude -p "Using the docs MCP server (mcp__docs__* tools), read api.md and compare the documented endpoints with the handlers in routes/. Report any endpoint that is undocumented, or documented but not implemented, and any status code mismatch. Do not edit any files. Keep the answer short." --allowedTools "mcp__docs__read_text_file,mcp__docs__list_directory,Read,Grep,Glob"
```

Allowed: the two docs-server read tools and Claude's read-only file tools, which is everything a docs-vs-code audit needs.
Not allowed: `Edit`/`Write`, any `Bash`, and the docs server's write tools. With nobody watching, the worst it can do is
read files and print a report.
