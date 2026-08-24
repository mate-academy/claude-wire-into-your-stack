# NOTES

## Server (MCP)

Connected the `github` MCP server (`@modelcontextprotocol/server-github`) at project scope, committed in `.mcp.json`. It's useful here because the review/PR loop on this repo is otherwise manual — being able to list and read pull requests from inside a session means Claude can check in-flight work before scaffolding something that overlaps it, or summarize what changed for a teammate.

The server needs `GITHUB_PERSONAL_ACCESS_TOKEN`; `.mcp.json` references it as `${GITHUB_PERSONAL_ACCESS_TOKEN}` rather than committing the value, so each teammate sets it in their own environment.

Permission rule: `mcp__github__list_pull_requests` is allowed, scoping the server to a read-only listing tool rather than blanket-allowing all of its write-capable tools (creating issues, merging PRs, pushing files, etc.). Used it for real to list open pull requests on this repo.

**Caveat to fix:** that allow rule currently lives in `.claude/settings.local.json`, which is gitignored (personal, machine-local). That means it doesn't travel with the repo — a teammate who clones this branch gets the committed `.mcp.json` but not the scoping rule, so they'd hit an unscoped prompt instead of the intended narrow allowlist. This should move into the committed `.claude/settings.json` for the rule to actually ship with the wiring.

## Skill

`new-resource` (`.claude/skills/new-resource/SKILL.md`) captures the repeated "add a CRUD resource" workflow this project follows: one route file mirroring `routes/users.js` (list/get/create/update, matching 400/404/error shapes), a matching `db/store.js` extension, a `tests/<resource>.test.js` mirroring `tests/users.test.js`, a mount line in `server.js`, and a docs section in `docs/api.md` — all seven steps required together, not partial scaffolds.

The description is worded to trigger on the actual request shape ("add a resource/entity/endpoint... e.g. 'add a posts resource'") without being named directly. Confirmed it fires: the roles resource (see below) was produced by asking for a new resource in plain language, and the skill applied the full pattern — route, store functions, tests, and docs — unprompted.

## Command

`/commit` (`.claude/commands/commit.md`) captures the repeated "make sure this is safe to ship, then commit it" sequence: run `npm run lint` and `npm test` first and stop on failure, review the diff against this repo's four conventions (one route file per resource, all data access through `db/store.js`, 400/404 validation, `{ "error": ... }` responses), stage files by name rather than `-A`, then write a commit message focused on *why*. Worth a shortcut because it's the same five-step checklist every time and skipping a step (e.g. committing without running tests) is the easy mistake to make under auto mode.

Ran it for the roles-resource change: lint and all 15 tests passed, the diff matched every convention, and it committed as `ba5c4a4 Add roles resource` — staging only the resource files and leaving unrelated untracked work (`.claude/`, `.mcp.json`) out of the commit.

## Hook

Two hooks are set in `.claude/settings.json` (project scope), both `PreToolUse` (prevent, not react):

1. **Force-push-to-main guard** — matcher `Bash`, running `.claude/hooks/block-force-push-main.sh`. Parses `git push` invocations for a force flag (`--force`, `-f`, `--force-with-lease`) and resolves the actual target branch (explicit arg, refspec, or the current branch if none is given). Denies only when that target is `main`/`master`. Chosen because force-pushing shared history is exactly the kind of destructive action that's easy to run by accident during a rebase/cleanup task and expensive to recover from — it should never depend on someone remembering to check first.
2. **`.env` access guard** — matchers `Read` and `Bash`, denying reads of `.env`/`.env.*` files (via the Read tool directly, or indirectly through Bash commands like `cat`/`grep`). Prevents credentials from ever entering the conversation, regardless of which tool would have exposed them.

Both were triggered on purpose and confirmed: the force-push guard blocked a live `git push --force origin main` in this session with its policy message; the `.env` guard blocks both direct reads and Bash-based access to `.env`.

## Headless

Ran the resource-scaffolding task headless:

```bash
claude -p "add a roles resource with title and description fields, following this repo's conventions" \
  --allowedTools "Read,Write,Edit,Grep,Glob,Bash(npm test:*),Bash(npm run lint:*)"
```

Locked down to exactly what the `new-resource` skill needs: `Read`/`Grep`/`Glob` to study the existing `users` pattern, `Write`/`Edit` to create `routes/roles.js`, extend `db/store.js`, add `tests/roles.test.js`, and update `server.js`/`docs/api.md`, and only `npm test`/`npm run lint` under `Bash` for the skill's own verification step. No other `Bash`, no git commands, no MCP tools — so a headless run of this prompt can scaffold and self-check a resource but can't commit, push, or touch anything outside the resource files.
