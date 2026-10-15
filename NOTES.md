# NOTES.md

## Server (MCP)

Connected the `filesystem` MCP server (`.mcp.json`), scoped to `./docs`. This project keeps its
authoritative API reference in `docs/api.md`, and this server lets Claude check that reference
against the actual routes without giving it access to the rest of the filesystem. The permission
rule allows only `filesystem/read_file` and `filesystem/list_directory` — read-only, no write or
move tools from that server.

Used it on a real task: read `docs/api.md` through the server and found it's out of date — it
documents `/health` and `/users` but not the `/products` or `/orders` routes that were added later.

## Skill

`express-routes` (`.claude/skills/express-routes/`) captures how a new route is written in this
project: `express.Router()` boilerplate, JSON responses, `module.exports`, and mounting it in
`server.js`. The description — "When creating a new route endpoint" — is worded to fire
specifically on route-creation requests rather than general Express questions, so it doesn't
trigger on unrelated Express work.

## Commands

- `/scaffold-route <name>` — scaffolds a new route file and mounts it in `server.js`. Worth a
  shortcut because it's the same handful of steps every time a resource is added, and it's easy to
  forget the mount line.
- `/review-conventions [file]` — checks a route file (or the current diff, if no file is given)
  against this repo's `CLAUDE.md` conventions: mounted in `server.js`, data access through
  `db/store.js`, `400`/`404` validation, and the `{ "error": "message" }` error shape. Reports
  pass/fail per rule with the offending line. Worth running before considering any route "done."
- `/ime_mail <name> <domain>` — lists users matching a name and email domain in one call, instead
  of hand-writing a `jq` filter each time. Takes `$ARGUMENTS` rather than `$1`/`$2` — this Claude
  Code version resolves multiple positional args off by one (verified: `$1` picked up the *second*
  word, `$2` never substituted), so the command splits the single `$ARGUMENTS` string itself.

## Hook

A `PostToolUse` hook on the `Write|Edit` matcher, in `.claude/settings.json` — it *reacts*, it
doesn't prevent. After Claude edits or writes any `.js` file, it runs `eslint --fix` on that file,
enforcing the project's lint standard automatically instead of relying on someone remembering to
run `npm run lint`. Verified live: introduced a `no-extra-boolean-cast` violation (`!!req.query...`)
via Edit and confirmed the hook rewrote it to the clean form immediately afterward, unprompted.

## Headless run

Ran `/scaffold-route orders` headless via:

```
claude -p "/scaffold-route orders" --allowedTools "Edit(routes/orders.js),Edit(server.js)"
```

Locked down to editing only those two exact files, since scaffolding a route only needs to create
the new route file and add its mount line in `server.js` — nothing else should change unattended.
Note: `Write(path)` isn't a valid scoped rule — only `Edit(path)` rules are matched by file
permission checks and cover all file-editing tools, including Write — so the initial attempt with
`Write(routes/orders.js)` was corrected to `Edit(routes/orders.js)`.
