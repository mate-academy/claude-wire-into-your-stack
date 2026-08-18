# Wiring notes

## Server: context7 (`.mcp.json`)

Connected [context7](https://github.com/upstash/context7) at project scope — it
resolves an npm package name to a library ID and pulls current, version-correct
documentation snippets for it. This repo is an Express API, so it's genuinely
useful for pulling in accurate Express (and any future dependency's) API
reference instead of relying on stale training data. It's credential-free for
this use (no `${VAR}` needed) and runs via `npx -y @upstash/context7-mcp`, no
install step required.

The permission rule in `.claude/settings.json` allows exactly the two read-only
tools the server exposes — `mcp__context7__resolve-library-id` and
`mcp__context7__query-docs` — rather than blanket-trusting the server.

Used it for real: asked headless (`claude -p ... --mcp-config .mcp.json
--allowedTools "mcp__context7__resolve-library-id mcp__context7__query-docs"`)
for Express's routing docs. It came back with `express.Router()` /
`app.use('/base/path', router)` guidance that matches this repo's own
one-router-per-resource convention. Note: the server's second tool is actually
named `query-docs`, not `get-library-docs` as some older docs describe —
found that by running it, not by trusting the docs, which is why the
permission rule names `query-docs`.

## Skill: `add-express-route`

This repo has exactly one way to add a resource: a router file mirroring
`routes/users.js` (validate → `400`/`404` → `{ "error": "message" }`, all
state through `db/store.js`, mounted in `server.js`). That's a repeated,
codified pattern worth teaching once rather than re-explaining per route, so
it's now `.claude/skills/add-express-route/SKILL.md`.

The description is scoped to "adding a brand-new resource/route" with concrete
trigger phrasing ("add a /products route", "create an endpoint for orders",
"scaffold a route for Y") and an explicit exclusion ("Not for editing an
existing route's logic or unrelated Express questions") so it doesn't fire on
every Express-adjacent question.

Confirmed it fires: ran headless with `claude -p "Add a new /widgets resource
to this API with the usual list, get-by-id, create, and update endpoints,
following how this project already does things." --allowedTools "Skill Read
Grep Glob"` — the skill was never named, and the transcript shows
`Skill(skill: "add-express-route", ...)` was invoked.

## Command: `/review-routes`

A prompt worth saving as a shortcut: reviewing a route change against this
project's own checklist (validation, error shape, `db/store.js`-only state,
status codes, tests, docs) before calling it done. `$ARGUMENTS` lets it target
either the current diff (default) or a specific file/path.

Ran it against `routes/users.js` and it produced a correct, checklist-by-checklist
pass — confirming both `docs/api.md` and `tests/users.test.js` are in sync with
the route, with no fixes needed.

## Hook: block force-push (PreToolUse / Bash)

Set a **PreToolUse** hook (prevent, not just react) matching the `Bash` tool,
running `.claude/hooks/block-force-push.js`. It inspects `tool_input.command`
for `git ... push ... --force` / `-f` / `--force-with-lease` in the same shell
segment, and if it matches, exits `2` with a message on stderr — which Claude
Code treats as a block, feeding the reason back to Claude instead of running
the command. A plain `git push` is left untouched.

This is the one standard that should hold no matter who's driving: nobody
(including an unattended headless run) should be able to force-push over this
shared repo's history without a human doing it themselves.

Triggered it on purpose: pointed a disposable local bare repo (`/tmp/fake-remote.git`,
never touching the real `origin`) at a scratch clone, gave it diverging
history, then asked headless Claude to run `git -C <scratch clone> push
--force origin HEAD:main`. The call showed up in `permission_denials` and
Claude reported the hook rejected it. A non-force push to the same scratch
remote went through unblocked, confirming the guard is scoped to `--force`
specifically, not `push` in general.

(First pass of the hook used a `\bgit\s+push\b` regex requiring `git` and
`push` to be adjacent, which missed `git -C <dir> push --force` — fixed by
checking each shell segment for `git`, `push`, and a force flag independently
rather than requiring adjacency.)

## Headless task run

Reused the context7 verification above as the headless task: `claude -p
"Use the context7 MCP server to fetch Express.js docs about routing..."
--mcp-config .mcp.json --strict-mcp-config --allowedTools
"mcp__context7__resolve-library-id mcp__context7__query-docs"`.

Locked down to exactly those two MCP tools — no `Read`/`Write`/`Edit`/`Bash`
at all — since the task is pure documentation lookup and has no reason to
touch the filesystem or shell. This is the same server + permission wiring
above, just run with nobody watching.
