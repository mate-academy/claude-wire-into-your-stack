# NOTES.md

## Server (MCP)

I connected `docs-filesystem`, the official filesystem MCP server pointed at this repo's `docs/`
folder, at project scope in `.mcp.json`. It's credential-free and genuinely useful here: `docs/api.md`
is the hand-written API reference that's easy to let drift out of sync with the routes, so giving
Claude a direct, scoped way to read it (rather than relying on it remembering or re-deriving the
contents) keeps route work and doc work grounded in the same source. The permission rule in
`.claude/settings.json` allows only three read-only tools from that server —
`read_text_file`, `list_directory`, `get_file_info` — nothing that writes. I used it early on to list
and read `docs/api.md` before editing it.

## Skill

The skill (`add-resource-route`) captures the five-step pattern this project repeats every time a
new REST resource is added: store helpers in `db/store.js`, a route file with the project's
`400`/`404`/`{ "error": ... }` conventions, mounting it in `server.js`, a `supertest` test file
mirroring `tests/users.test.js`, and a `docs/api.md` update. I wrote the description around the
concrete phrasing someone would actually type — "add a `/products` route," "create a new resource
for orders" — rather than the skill's own name, and confirmed it by asking for "add a `/products`
route" without naming the skill; it fired and scaffolded all five pieces correctly.

## Command

`/summarize-changes` diffs the current branch against a base branch (`main` by default, or `$1`)
and writes a grouped, read-only summary of what changed and why — the kind of thing I'd otherwise
write by hand before opening a PR or when picking a long session back up. It's scoped to
`Bash(git status/diff/log)` only, so it can't modify anything. It replaced an earlier draft
(`check-route`) that turned out to just re-run the skill's own checklist in reverse — not worth a
separate command, so I dropped it in favor of something that doesn't overlap with what the skill
already does.

## Hook

Two hooks in `.claude/settings.json`, one of each kind:

- **`block-npm-publish.js`** (`PreToolUse`, matcher `Bash`) — *prevents* `npm publish` from ever
  running on this practice package. It only flags a command when `npm publish` actually starts a
  shell command segment, not when the text merely appears elsewhere in the command string — I hit
  this the hard way when an earlier version blocked a `git commit` because the commit message
  mentioned "npm publish" in a sentence.
- **`lint-on-edit.js`** (`PostToolUse`, matcher `Edit|Write`) — *reacts* to every edit by running
  `eslint --fix` on the touched file, so the codebase stays lint-clean without a manual step. This
  made the skill's old "run `npm run lint`" instruction redundant, so I removed it from the skill.

Both were triggered on purpose to confirm they fire: `npm publish` got blocked with exit code 2,
and an injected lint violation (`/a   b/`, flagged by `no-regex-spaces`) got auto-fixed to
`/a {3}b/` after an `Edit` call.

## Headless run

I ran `/summarize-changes` headless:

```
claude -p "/summarize-changes" --allowedTools "Bash(git status:*),Bash(git diff:*),Bash(git log:*)" --max-turns 5
```

I picked this task specifically because it's the smallest, safest thing to hand to an unattended
process: the `--allowedTools` list only grants three read-only `git` subcommands — no `Read`,
`Write`, or `Edit` at all — so the run is structurally incapable of touching a file, even in a
worst-case loop. `--max-turns 5` is a hard backstop on top of that, capping how many agent turns it
can spend regardless. The run exited cleanly on its own with a correct, grouped summary of the
branch's changes and no side effects.

This choice came out of a discussion about what happens when a headless run needs a permission
that nobody's there to grant: Claude Code can't prompt without a TTY, so an unmatched or `ask`-tier
action resolves closed (denied) rather than hanging — but the safer habit is still to scope
`--allowedTools` down to exactly what the task needs, rather than relying on that fail-closed
behavior as the only guardrail.