# NOTES

## 1. The server

The **filesystem MCP server** at project scope, pointed at this repo's `docs/`
(`.mcp.json`). Credential-free, so it works on a fresh clone with no setup. It earns its
place because `docs/api.md` is the contract every endpoint change must update — the skill's
step 6 and the command's item 9 both point at it.

The permission rule scopes it to reading instead of blanket-allowing the server: allowed
`read_text_file`, `list_directory`, `search_files`; denied `write_file`, `edit_file`,
`move_file`, `create_directory`. Docs change through review, not through a side channel.

## 2. The skill

`.claude/skills/api-endpoint/SKILL.md` captures the routine every endpoint change repeats:
route file shape, mounting in `server.js`, all state through `db/store.js`, the 400/404
rules, the `{ "error": "message" }` body, the `node:test` + supertest file, the `docs/api.md`
entry. Steps 5-7 are the ones people skip, which is why they are written down.

The description fires on the situation, not the skill's name: it names the surface
(`routes/`, "route", "endpoint", "resource") and carries three concrete phrasings — "add
DELETE /users/:id", "add a /projects resource", "make POST /users reject a blank email" — so
a request that never says "skill" still matches, and unrelated work does not.

## 3. The command

`/api-review` — check a change against this project's conventions before opening a PR. Worth
a shortcut because it is the prompt I would retype before every PR, and it injects state I
would otherwise gather by hand: branch, uncommitted files and the diff against `main`, via
`!` context commands, then a ten-item checklist and one verdict line.

CI already runs lint and tests, so the checklist targets what CI cannot see — error shape,
the store boundary, handler comments, an untested error branch, a missing docs entry. Its
`allowed-tools` are read-only plus lint/test, so a review can never edit the repo.

## 4. The hook

`PostToolUse` on `Write|Edit`, running `node .claude/hooks/eslint-fix.js`.

It **reacts**, deliberately: ESLint cannot inspect code that is not on disk yet, so a
`PreToolUse` guard is impossible here. The standard was already the repo's own — `ci.yml`
runs `npm run lint` on every push and PR — and the hook moves it from CI to the moment of the
edit. It applies `eslint --fix` and returns whatever auto-fix cannot resolve as
`additionalContext`, so it is repaired in the same turn. It never blocks an edit: a malformed
payload, a non-`.js` file or missing `node_modules` all exit 0. Verified both ways on
`routes/health.js`.

## 5. The headless run

I ran the task-selection step itself headless, from PowerShell:

```
claude -p "Pick a single, well-scoped task and run it, pre-approving only the tools it needs with a tight --allowedTools set."
```

It picked `/api-review routes/users.js` — narrow, self-terminating, writes nothing — and
settled on:

```
claude -p "/api-review routes/users.js" --permission-mode default --allowedTools "Read,Grep,Glob,Bash(git rev-parse:*),Bash(git status:*),Bash(git diff:*),Bash(npm run lint),Bash(npm test)"
```

The lockdown is what is *absent*: no `Edit`, no `Write`, no general `Bash` — only reads, the
three git queries the command needs, and the two commands CI runs. It mirrors the
`allowed-tools` line in `api-review.md`, so the command gains no authority by being invoked a
different way.

The run also showed the point of the step: **headless does not prompt, it stops.** The
unattended session could not launch `claude` from its own shell or write
`.claude/settings.local.json` — neither pre-approved, nobody there to approve — so it produced
the plan and the command rather than the review itself.
