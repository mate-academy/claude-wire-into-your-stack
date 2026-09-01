# NOTES

## The server

Connected the official `@modelcontextprotocol/server-filesystem`, scoped to
`docs/` only, as the `docs` server in `.mcp.json` (project scope). It's
useful here specifically because this repo keeps a hand-written API
reference (`docs/api.md`) that has to track the routes by hand — giving
Claude a dedicated, narrowly-scoped way to read that folder makes it a
natural tool to reach for whenever a route changes, without handing it
broader filesystem access it doesn't need for that job.

The permission rule in `.claude/settings.json` allows only
`mcp__docs__read_text_file` and `mcp__docs__list_directory` — the two
read-only tools I actually use. The server also exposes write/edit/move
tools (`write_file`, `edit_file`, `move_file`, `create_directory`); those
are deliberately left out of the allow-list rather than blanket-approving
the whole server, so any attempt to use them still hits the normal
permission prompt.

Used it for real in a headless run (`--allowedTools "mcp__docs__read_text_file
mcp__docs__list_directory"`, nothing else) asking Claude to read
`docs/api.md` through the server and list the documented endpoints — it
came back with all five, matching the file.

## The skill

`route-docs-sync` (`.claude/skills/route-docs-sync/SKILL.md`) captures a
pattern this project repeats: a route change here isn't just a route change
— it always also touches `db/store.js` (the data helper), `docs/api.md`
(the hand-written reference), and a test. It's easy to do the route and
stop there, so the skill spells out all four as one task.

The description is scoped narrowly to "adding, changing, or removing an
Express route in this project's `routes/*.js` files" so it fires on route
work specifically, not on unrelated requests. I confirmed it fires by
running a headless prompt that only said "Add a DELETE /users/:id route
... that removes a user by id" — no mention of the skill — and it found
`SKILL.md` on its own, said "implementing all four pieces," and updated
the store helper, the route, `docs/api.md`, and the tests together (all 7
tests passed afterward). First attempt without documentation updates
taught me the description needed to state "do this even if nothing else
asked for docs" explicitly — the model was completing the route and tests
correctly from the existing code's style alone, without opening the skill
at all, until the description was specific enough to be worth opening.

## The command

`/check-conventions` (`.claude/commands/check-conventions.md`) reviews the
current diff — or a given path via `$ARGUMENTS` — against the conventions
in `CLAUDE.md`: data access through `db/store.js`, `400`/`404` handling,
the `{ "error": "message" }` shape, `docs/api.md` staying in sync, and test
coverage. It's worth a shortcut because it's the kind of check I'd
otherwise skip before a commit — running it costs nothing and it read-only
reviews, it doesn't touch code.

Ran `/check-conventions routes/users.js` headless and it correctly
confirmed the route/store/docs conventions were followed, while flagging
two real gaps: no test for the `400` case on `POST /users` and none for
the `400` case on `PUT /users/:id`. That's a genuine, useful finding, not
a rubber stamp.

## The hook

A `PostToolUse` hook on the `Edit|Write` matcher, in `.claude/settings.json`,
running `.claude/hooks/post-edit-lint.js`. It reacts rather than blocks —
there's nothing here worth stopping an edit over, just a standard (this
project's eslint config) that should always hold without anyone having to
remember to run `npm run lint` by hand.

The script reads the `PostToolUse` payload, checks whether the edited file
is a `.js` file, and runs `eslint --fix` on it. I verified it two ways:
piping a simulated hook payload for a file containing `if (!!x)` into the
script directly (it rewrote it to `if (x)` via eslint's
`no-extra-boolean-cast` fix), and then having a live headless Claude
session write that exact file for real — the resulting file came back
already fixed, and Claude's own response noted "a formatter hook
simplified `!!x` to `x` on save."

## The headless run

Ran `/check-conventions routes/users.js` headless via
`claude -p "/check-conventions routes/users.js"`, locked to
`--allowedTools "Read Grep Glob Bash(git diff:*) Bash(git status:*)"` —
no `Edit` or `Write`. This is a read-review command by design, so it
never needed permission to change anything; scoping the tools to exactly
that meant it was safe to let it run unattended, and it did — it reported
real findings without touching a single file.
