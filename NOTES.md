# Notes: wiring Claude into the Course API

## Server (MCP)
I connected **fireblocks-docs** (`https://developers.fireblocks.com/mcp`) at project scope in `.mcp.json`. It's an HTTP server that needs no credentials and gives Claude search and read access to the Fireblocks developer docs and OpenAPI spec, so answers come from the current docs instead of memory. I used it once to list Fireblocks workspace user roles; the answer came from the `role` enum in the OpenAPI spec and the Manage Users guide.

The server has three tools. `.claude/settings.json` allows only the two read-only ones:
- `mcp__fireblocks-docs__search_fireblocks_developer_docs`
- `mcp__fireblocks-docs__query_docs_filesystem_fireblocks_developer_docs`

The third, `submit_feedback`, sends a report to the Fireblocks docs team. I left it out on purpose: allowing all of `mcp__fireblocks-docs__*` would let Claude send that without asking. It still prompts.

## Skill
`.claude/skills/add-endpoint/` captures how an endpoint is added or changed here. Every endpoint change touches the same five places: the route file, a `db/store.js` helper, mounting in `server.js`, tests, and `docs/api.md`. The skill turns that into a checklist with the project's rules (`Number(req.params.id)`, `400`/`404` with `{ error }`, `201` on create, `204` on delete, `store.reset()` in tests) and adds `reference/test-template.md` for the test layout.

The description names the trigger (adding, changing or removing an HTTP endpoint or resource), lists the files involved, gives example requests ("add a DELETE /users/:id", "add a /posts resource"), and rules out lint, CI and non-API work, so it doesn't fire on unrelated edits. To confirm it fires, I asked "add a DELETE /users/:id endpoint" without naming the skill. It loaded, and the change covered the route, store, tests and docs, with lint and all 7 tests passing.

## Command
`/tree [directory]` (`.claude/commands/tree.md`) runs `tree -a -I .git $1`. It shows the repo including dotfiles (`.mcp.json`, `.claude/`) but not the `.git` internals. I was running that by hand to check where config files landed. `allowed-tools: Bash(tree -a -I .git:*)` pre-approves only that command, with any directory argument.

Two things I learned: without an argument, the `!` line runs automatically, but with `$1` Claude Code asked Claude to run it. And once `node_modules/` is installed, a bare `/tree` produces about 120 KB of output; `-I '.git|node_modules'` would fix that.

## Hook
A **PreToolUse** hook on the **Bash** tool **prevents** pushes to `main`. It runs `.claude/hooks/block-push-to-main.js`, which reads the command, and exits with code 2 (blocking the call) when the push would update `main`. That covers an explicit `main`, `src:main`, `+main` and `refs/heads/main`, a bare `git push` or `git push -u origin HEAD` while on `main`, `--all`/`--mirror`, and pushes chained after `&&` or `;`. Pushes of other branches go through. I wrote it in Node because the project already needs it, so it doesn't depend on `jq`.

I tested it on 14 sample commands, then asked Claude to run `git push` on `main`, and it was blocked. It errs toward blocking: a push to `main` that only appears inside a quoted string or heredoc is also blocked. It only guards Claude's tool calls; a `git push` typed in a terminal (or with `!`) isn't checked, so GitHub branch protection is still the real safeguard.

## Headless run
I ran a docs-coverage check with nobody watching:

```
claude -p "Check that every route in routes/ has a matching entry in docs/api.md and list any gaps" --allowedTools "Read,Grep,Glob"
```

It found no gaps: all 6 routes, including the new `DELETE /users/:id`, are documented with matching status codes, and the docs list nothing the code doesn't implement.

`--allowedTools` is limited to `Read`, `Grep` and `Glob` because the task only needs to find route files, search for handlers and read the docs. There's no `Edit`/`Write`, so it can't change files, and no `Bash`, so it can't run commands, install packages or push. Anything outside that set isn't pre-approved, and with no one there to approve it, a headless run can't use it. That makes the run safe to repeat unattended, e.g. as a CI or pre-PR check.
