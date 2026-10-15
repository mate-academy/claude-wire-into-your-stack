# Notes

## MCP server

Two servers are wired in `.mcp.json`: `fetch` (mcp-server-fetch via uvx) and `filesystem`
(@modelcontextprotocol/server-filesystem scoped to `../docs`). The filesystem server is the
meaningful one here — it lets Claude read the project's reference docs without touching the source
tree. The permission rule in `settings.local.json` is `enabledMcpjsonServers: ["fetch",
"filesystem"]`, which opts both servers in without granting them any broader file-system access
beyond the single directory the server was started with.

## Skill

The `add-resource` skill captures the three-file sequence every new REST resource requires:
store helpers in `db/store.js`, a route file in `routes/`, and a test file in `tests/`, then a
one-line mount in `server.js`. Without the skill, that pattern has to be re-derived from reading
existing files every time. The description reads *"Use when asked to add a new REST resource
(route, CRUD endpoints, or 'add a \<thing\> resource/route')"* — the phrase "add a \<thing\>
resource/route" matches the natural way the request gets phrased, so the skill fires on the first
line of the prompt rather than after Claude has already started guessing the pattern.

## Command

`/pr-check` runs a focused review of the current git diff against this project's seven explicit
conventions: route placement, store-only data access, router mounting, error JSON shape, status
codes, input validation, and test coverage. It's worth a shortcut because it checks the same
checklist on every PR — the kind of thing that's easy to verify once but easy to forget across ten
PRs. Running it as a slash command costs one keystroke and returns a concrete file-and-line verdict
rather than a generic code review.

## Hook

The hook is a `PostToolUse` on the `Edit` matcher in `.claude/settings.json`. It *reacts* — it
runs `npm run lint` after every file edit rather than preventing the edit. The event is
`PostToolUse`, so ESLint sees the file as it was actually written. A `PreToolUse` guard would catch
nothing useful here (the file hasn't changed yet); a post-edit lint run is what surfaces a real
violation.

## Headless run

The headless run added a `products` resource — a well-scoped task with a clear definition of done
(all tests pass). The locked-down `--allowedTools` set was `Read,Write,Edit,Bash(npm test)`: the
three file-manipulation tools the task actually requires, plus a prefix-matched Bash rule that
allows exactly `npm test` and nothing else. That means the agent couldn't start the dev server,
run `rm`, or make any network call — the blast radius was defined before execution started.
