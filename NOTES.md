# Notes

## Server
I connected a filesystem MCP server (`docs-fs`, `@modelcontextprotocol/server-filesystem`) at project scope, pointed only at `./docs`. It needs no credentials and gives Claude direct access to the API reference, which is the source of truth when it adds or checks endpoints. The permission rule in `.claude/settings.json` allows only the read-only tools `read_text_file`, `list_directory` and `search_files`, so the server's write, edit and move tools stay off. I named it `docs-fs` because a personal `filesystem` server in local scope would otherwise shadow it.

## Skill
`add-route` captures how this project adds an endpoint: one file per resource, mounted in `server.js`; data access only through `db/store.js`; 400 and 404 validation with `{ "error": "message" }` bodies; tests with supertest; and a `docs/api.md` entry. The description lists concrete trigger phrases ("add a DELETE /users/:id", "new route for ...") and excludes lint and CI work. I confirmed it fires: asking headless "Add a DELETE /users/:id endpoint" without naming the skill made Claude invoke `add-route`.

## Command
`/review-route <file>` reviews a route file against the seven checks from CLAUDE.md and the skill, reports PASS or FAIL with `file:line`, and cannot edit anything (`allowed-tools: Read, Grep, Glob`). It's worth a shortcut because I'd otherwise retype the checklist for every route change, and it gives the same review each time. A first run on `routes/users.js` found real gaps in id validation and tests.

## Hook
A `PostToolUse` hook on `Edit|Write` runs `.claude/hooks/lint-edited-file.sh`. It reacts after the edit rather than preventing it. The hook runs `eslint --fix` on the edited `.js` file and, if errors remain, exits 2 so ESLint's output goes back to Claude to fix. Creating a file containing `foo.bar();` made the hook report a `no-undef` error back to Claude.

## Headless run
I ran `claude -p` to run `npm test` and summarise the result (all 8 tests passed). I allowed only `Bash(npm test),Read,Grep,Glob`. The shell is limited to that one exact command and there are no edit or write tools. With nobody watching, unlisted tools are denied, so the run could not change any files.
