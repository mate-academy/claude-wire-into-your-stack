# NOTES

Why this repo is wired the way it is.

## 1. The server

I connected the **filesystem MCP server** at project scope, pointed at this repo's
`docs/` folder (`.mcp.json`, launched with `npx -y @modelcontextprotocol/server-filesystem`).
It is credential-free, so a teammate who clones the repo gets it working with no setup.
It is useful here because `docs/api.md` is the contract every endpoint change has to
update — the skill's step 6 and the command's checklist item 9 both point at it — so
Claude needs to read that file constantly and reliably.

The permission rule scopes the server to reading, not blanket-allowing it. In
`.claude/settings.json` I allowed exactly the three read tools I actually use
(`read_text_file`, `list_directory`, `search_files`) and explicitly denied the four
mutating ones (`write_file`, `edit_file`, `move_file`, `create_directory`). Docs get
edited through the normal review path, not silently through a side channel.

## 2. The skill

`.claude/skills/api-endpoint/SKILL.md` captures the seven-step routine this project
repeats every time an endpoint changes: the route file shape, mounting it in
`server.js`, going through `db/store.js` for all state, the 400/404 rules, the
`{ "error": "message" }` body, the `node:test` + supertest file, and the `docs/api.md`
entry. Steps 5-7 are the ones people skip, which is exactly why they are written down.

The description fires on the *situation*, not on the skill's name. It names the
trigger surface (`routes/`, "route", "endpoint", "resource") and carries three concrete
example phrasings — "add DELETE /users/:id", "add a /projects resource", "make POST
/users reject a blank email" — so a request that never says "skill" still matches it.
It also names the artifacts it governs, which keeps it from firing on unrelated work.

## 3. The command

`/api-review` — review a change against this project's conventions before opening a PR.
It is worth a shortcut because it is the prompt I would otherwise retype before every
PR, and it carries state I would otherwise have to set up by hand: it injects the branch,
the uncommitted files and the diff against `main` via `!` context commands, then walks a
fixed ten-item checklist and returns a single verdict line.

The real value is the framing: CI already runs lint and tests, so the command
deliberately targets the conventions CI *cannot* see — the error-response shape, the
store boundary, the handler comments, an untested error branch, a missing docs entry.
Its `allowed-tools` are read-only plus lint/test, so a review can never edit the repo.

## 4. The hook

`PostToolUse` on matcher `Write|Edit`, running `node .claude/hooks/eslint-fix.js`.

It **reacts** — deliberately. ESLint cannot inspect code that is not on disk yet, so a
`PreToolUse` guard is structurally impossible here; the file has to be written first.
The standard it holds was already declared by the repo: `.github/workflows/ci.yml` runs
`npm run lint` on every push and PR. The hook just moves that from CI five minutes later
to the moment of the edit.

The script does two things: it applies `eslint --fix` to the edited `.js` file, and
anything auto-fix cannot resolve it returns as `additionalContext`, so Claude repairs it
in the same turn instead of hearing about it from CI. It never blocks an edit — a
malformed payload, a non-`.js` file, or missing `node_modules` all exit 0 silently.
Verified both ways on `routes/health.js`: `if (!!res)` was rewritten to `if (res)`, and
an undefined `BUILD_SHA` came back as a `no-undef` error in context.

## 5. The headless run

> **TODO — not run yet.** Task 5 has not been executed, so there is nothing honest to
> record here. Planned run, with the scope deliberately matching the command's own
> read-only `allowed-tools`:
>
> ```
> claude -p "/api-review" \
>   --allowedTools "Read,Grep,Glob,Bash(git diff:*),Bash(git status:*),Bash(git rev-parse:*),Bash(npm run lint),Bash(npm test)"
> ```
>
> The lockdown is that no write tool is on the list — no `Edit`, no `Write`, no general
> `Bash`. A review that runs with nobody watching should be able to read the repo and
> run the two green-check commands, and be structurally incapable of changing anything.
> Replace this block with what actually happened once the run is done.
