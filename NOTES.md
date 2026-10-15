# NOTES

## The server

Connected `@modelcontextprotocol/server-filesystem` at project scope, pointed
at `./docs` — this repo's only doc, `docs/api.md`, is the API reference every
route should stay in sync with. It's credential-free and specific to this
repo: it gives Claude a tool scoped to "this folder is documentation, treat
it as the source of truth," rather than a generic file read. The permission
rule in `.claude/settings.json` allows only `mcp__docs__read_text_file` and
`mcp__docs__list_directory` — the two read-only tools actually needed — not
`write_file`, `edit_file`, `move_file`, or `create_directory`, so the server
can't touch anything on disk no matter what it's asked.

## The skill

`.claude/skills/express-route/SKILL.md` captures the convention every route
in this repo already follows: validate first (`400`), look up second
(`404`), all data access through `db/store.js`, error responses always
`{ "error": "message" }`, and a matching test using `node:test` +
`supertest` with `store.reset()` in `beforeEach`. The description is scoped
to "adding, changing, or reviewing a route/endpoint," with concrete trigger
phrasing ("add a DELETE /users/:id route", "add an endpoint for X") close to
how that request would actually be worded, so it fires on route work
specifically rather than on unrelated changes.

## The command

`/sync-api-docs` — the check I'd otherwise run by hand after touching any
route: read `docs/api.md` (via the `docs` MCP server), diff it against the
actual handlers in `routes/`, and update the doc to match, or say nothing's
out of date and leave it alone. Takes an optional argument to focus on one
route file. It's the direct product of wiring in the server: without it,
this is just "read a file"; with it, it's "read the file that's the
documented source of truth for this repo, through a tool scoped for exactly
that."

## The hook

A **PreToolUse** guard on the `Bash` matcher
(`.claude/hooks/block-destructive-bash.js`), not a reactive formatter — I
checked what `eslint --fix` could actually change under this repo's minimal
`eslint:recommended` config first (mostly correctness rules, not
auto-fixable style), found nothing to demonstrate, and went with the other
suggested shape instead: something that *prevents* rather than reacts. It
reads the Bash command about to run from stdin and blocks (exit code 2)
`rm -rf`-style deletes, `git push --force`, and `git reset --hard`; anything
else passes through. I tested this directly rather than trusting it blind —
fed it sample tool-call JSON and confirmed it blocked
`rm -rf build/tmp-output` and `git push --force origin main`, while letting
`npm test` and a normal `git push -u origin <branch>` through untouched.
This is the same risk Lesson 47 covered: an unattended run with no cap can
wreck something before anyone's watching. This hook is that lesson made
concrete for this repo.

## The headless run

I wired the server, skill, command, and hook, and unit-tested the hook's
blocking logic directly (above). I was not able to complete a live
end-to-end `claude -p` session against this repo before submitting — the
environment I was working in blocks spawning a nested Claude Code process as
a sensitive action, and running it by hand from the host terminal hit a
local PATH issue that wasn't resolved in time. Flagging this directly
rather than claiming a run that didn't happen. The intended command was:

```
claude -p "/sync-api-docs" --allowedTools "mcp__docs__read_text_file,mcp__docs__list_directory,Read,Edit"
```

locked down to exactly what that task needs: the two read-only MCP tools,
`Read` for the route files, and `Edit` for `docs/api.md` if it drifted — no
`Bash`, no write access anywhere else. Reading `docs/api.md` against
`routes/users.js` and `routes/health.js` by hand, the doc is currently
accurate (methods, status codes, and required fields all match), so the
expected outcome of that run was "nothing out of date" — consistent with
what the command itself does in that case, but not the same as having
watched it happen.
