# Notes

Everything here is project-scoped and committed, so a fresh clone gets the same setup.

**Server.** I connected the official filesystem MCP server, pointed only at `docs/`. I wanted the fetch server first, but this machine has no `uv`, and the filesystem one runs from plain `npx` with no keys. It's useful because `docs/api.md` is the thing that has to stay in sync whenever a route changes. The permission rule allows only the read tools (read, read multiple, list, tree, search, file info). I also put the write, edit, create-directory and move tools on the deny list. That's belt and braces, since the server could write if someone approved it.

**Skill.** `adding-api-routes` captures how a route gets written here: router file per resource, 400/404 with `{ error }`, everything through `db/store.js`, mount in `server.js`, a test file, and a line in `docs/api.md`. The description names the actual places (routes/, server.js, store) and says what it's not for, so "add a GET /posts endpoint" should trigger it and a generic JS question shouldn't.

**Command.** `/review <file | branch | range>` does a short review against the CLAUDE.md conventions and gives at most 8 tagged bullets and a verdict. I run that kind of review all the time, and typing the checklist out each time is annoying. It's limited to read-only git and file tools, so it can't change anything.

**Hook.** A PostToolUse hook on `Edit|Write|MultiEdit` that formats the touched file. It reacts after the edit rather than preventing anything. It runs prettier through `npx` (pinned), so I didn't touch `package.json`, and then eslint `--fix` if eslint is installed. It always exits 0 so a formatting hiccup never blocks Claude.

**Headless.** `.claude/scripts/headless-readonly.sh` runs `claude -p` with only `Read`, `Glob`, `Grep` and `Bash(ls:*)` allowed. The prompt asks it to summarise `routes/` and then edit `server.js`. Nobody is there to approve the edit and `Edit` isn't on the allow list, so the edit should be refused and `git status` should stay clean. I locked it to reading because a run with nobody watching shouldn't be able to change files.
