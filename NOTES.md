# NOTES

## Server (MCP)

Connected `docs-fs`, the `@modelcontextprotocol/server-filesystem` server, scoped
to the `./docs` folder (`docs/api.md`, the API reference). It's credential-free
and directly useful for this repo: Claude can look up the documented request/
response shapes while writing or reviewing routes instead of guessing. The
permission rule in `.claude/settings.json` only allows the read-only tools
(`read_file`, `read_text_file`, `read_multiple_files`, `list_directory`,
`directory_tree`, `search_files`, `get_file_info`, `list_allowed_directories`) —
no write/move/delete tools are allowed, so the server can't edit the docs it's
meant to be read from. Verified it works by listing `./docs` and reading
`docs/api.md` through it.

## Skill

`.claude/skills/australian-spelling/` captures a repeated proofing task: this
project's prose (README, NOTES.md, docs, comments) is written in Australian
English, not American English. The description is worded narrowly — "check
spelling", "proofread", "make wording Australian/British" — and explicitly
scoped to prose, with a "not for code identifiers, variable names, or general
code review" clause, so it doesn't fire on ordinary code-review requests or try
to rename American-spelled API fields/CSS properties.

## Command

`.claude/commands/check-conventions.md` reviews pending changes (or a given
path via `$ARGUMENTS`) against the four conventions in `CLAUDE.md`: one route
file per resource mounted in `server.js`, all data access through
`db/store.js`, correct 400/404 status codes, and the exact
`{ "error": "message" }` error shape. It's worth a shortcut because it's the
kind of check that's easy to skip before a PR but tedious to redo by hand every
time — running it is now one command instead of re-reading `CLAUDE.md` and the
diff side by side.

## Hook

Set a `PostToolUse` hook on the `Write|Edit` matcher
(`.claude/hooks/check-double-spaces.js`) — it **reacts**, not prevents: after a
file is saved, it scans the new content for mid-line double spaces (ignoring
leading indentation) and, if it finds any, exits with code 2 so Claude sees the
flagged lines and can clean them up. Chose react-after over block-before
because a double space isn't a risk worth stopping a write over — just a
standard worth catching automatically.

## Headless run

Ran `claude -p "/check-conventions routes/" --allowedTools "Read,Grep,Glob,Bash(git diff:*),Bash(git status:*)"`
to audit the existing route code against `CLAUDE.md` unattended. Locked it down
to `Read`, `Grep`, and `Glob` for inspecting files, plus `Bash` scoped to only
the `git diff` and `git status` subcommands (not a blanket `Bash`) — no
`Write`/`Edit` and no MCP tools, so the run could only read and report, never
modify the working tree.
