# Wiring notes

## Server

Connected `docs-fs` — the official `@modelcontextprotocol/server-filesystem`,
scoped to just this repo's `docs/` folder — at project scope in `.mcp.json`.
It's useful here because `docs/api.md` is the source of truth for the API
contract every route has to match, and pointing a dedicated server at it (via
`${CLAUDE_PROJECT_DIR:-.}/docs`) means any client that loads this `.mcp.json`
can read that contract without depending on a general-purpose file tool.
The permission rule in `.claude/settings.json` allows only the three read-only
tools I actually use — `read_text_file`, `list_directory`, `search_files` —
and leaves the server's write tools (`write_file`, `edit_file`,
`create_directory`, `move_file`) unapproved, so connecting it can't turn into
an accidental way to edit docs out from under review. Used it to read
`docs/api.md` through the server while checking the `/route-check` command's
docs-consistency step.

## Skill

`.claude/skills/new-route/SKILL.md` captures how a new resource gets added to
this API: storage helpers in `db/store.js`, a router in `routes/<resource>.js`
mounted in `server.js`, this project's `400`/`404` + `{ "error": "message" }`
convention, a matching `tests/<resource>.test.js`, and a `docs/api.md`
section. The description lists concrete trigger phrases ("add a posts
endpoint", "create a comments resource") and an explicit exclusion ("not for
editing an existing route's behavior or unrelated bug fixes") so it fires on
scaffolding requests and stays quiet on everything else.

## Command

`.claude/commands/route-check.md` (`/route-check <resource>`) reviews an
existing resource's route against the same conventions the skill scaffolds:
validation, error shape, store-only data access, mounting, test coverage, and
docs. It's worth a shortcut because it's the review I'd actually want before
merging any route change — dry-running it against `users` immediately
surfaced a real gap (no test for the `POST /users` `400` case), which is what
the headless task below fixed.

## Hook

A `PostToolUse` hook on the `Edit|Write` matcher, in `.claude/settings.json`,
runs `.claude/hooks/lint-fix.sh` after every edit. The script pulls
`tool_input.file_path` from the hook's stdin JSON and, for any `.js` file,
runs this project's own `eslint --fix` on it. It reacts rather than prevents,
because "reformat" is exactly the kind of thing that should happen quietly
after the fact, not block the edit. I added `quotes: ['error', 'single']` and
`semi: ['error', 'always']` to `eslint.config.js` so the rule set actually
enforces (and can autofix) the single-quote/semicolon style every existing
file in this repo already follows — before that, `eslint --fix` had nothing
fixable to do.

## Headless

Ran `claude -p` to add the missing `POST /users` `400` test case that
`/route-check` had surfaced, with
`--allowedTools "Read,Edit,Bash(npm test:*)"`. `Read` and `Edit` so it could
see and modify the test file; `Bash` narrowed to `npm test:*` so it could
verify the suite still passes without earning shell access to git, the
filesystem, or anything else. It touched only `tests/users.test.js`, and all
6 tests passed afterward.
