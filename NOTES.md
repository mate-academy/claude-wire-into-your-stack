## Wiring notes

**Server.** Connected the `fetch` MCP server (`uvx mcp-server-fetch`) at project scope via `.mcp.json`.
It's useful here because it lets Claude pull in live Express.js/Node reference docs while writing or
reviewing routes, instead of relying on training data. The permission rule in `.claude/settings.json`
allows only `mcp__fetch__fetch` — nothing else the server might expose, and nothing beyond a read-only
fetch. Verified by fetching `https://expressjs.com/en/5x/api.html` and having Claude reason about the
page content in response to a real question.

(One local-machine wrinkle: this network runs TLS-inspecting security software, so `uvx` needed
`--system-certs` to install the server package. That's baked into `.mcp.json`'s args since it's
harmless on machines without TLS inspection. If the fetch tool itself still can't reach a site on your
machine, it's a local trust-store issue — set `SSL_CERT_FILE` to your system's intercepting CA bundle
when launching Claude; that's a per-machine env setting, not something to hardcode into the repo.)

**Skill.** `new-route` (`.claude/skills/new-route/SKILL.md`) captures this repo's fixed pattern for
adding a resource: data/helpers in `db/store.js` first, one router file per resource mounted in
`server.js`, `400`/`404` validation, the `{ "error": "message" }` error shape, and a mirrored test file.
The description is scoped to "adding a new resource or endpoint" with concrete trigger examples, and
explicitly excludes editing existing routes or unrelated fixes, so it doesn't fire on everything.
Verified by asking "I want to add a new `/orders` endpoint, what are the steps?" without naming the
skill — Claude answered with the exact store-first / route-file / mount / validate / test sequence,
unprompted.

**Command.** `/pr-check` (`.claude/commands/pr-check.md`) runs lint + tests, diffs the branch against
`main`, and checks the diff against the conventions in `CLAUDE.md`, reporting whether the branch looks
ready for a PR. It's worth a shortcut because it's the exact sequence you'd run by hand before every
PR on this repo, and running it as one command means it never gets skipped under time pressure.

**Hook.** A `PostToolUse` hook on `Edit|Write` in `.claude/settings.json` runs `npm run lint -- --fix`
after every edit. It reacts rather than prevents — it cleans up after a change instead of blocking one.
Verified with `--debug-file` on a real edit: the debug log shows `Hook PostToolUse:Edit (PostToolUse)
success` running the lint --fix command.

**Headless.** Ran `/pr-check` headless: `claude -p "/pr-check" --allowedTools "Bash(npm run
lint:*),Bash(npm test:*),Bash(git diff:*),Read"`. Locked out `Edit`/`Write` entirely — this task only
inspects and reports on the branch, so there's no reason to let it change any files while unattended.
