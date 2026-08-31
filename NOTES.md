# NOTES — wiring Claude into the Course API

## Server (MCP)

**Connected:** `docs` — `@modelcontextprotocol/server-filesystem` pointed at the
repo root, at project scope in `.mcp.json` (run via `npx -y`, so a teammate
needs nothing installed and there is no credential).

**Why it's useful here:** it gives an unattended Claude run one explicit,
sandboxed path to read this repo's own routes, tests, and `docs/api.md` as the
canonical examples when scaffolding a new resource — without handing it the
ability to change files through that path.

**Permission rule** (`.claude/settings.json`): `allow` lists only the ten
read-only tools (`read_text_file`, `read_file`, `read_multiple_files`,
`list_directory`, `list_directory_with_sizes`, `directory_tree`, `search_files`,
`get_file_info`, `read_media_file`, `list_allowed_directories`); `deny` lists
`write_file`, `edit_file`, `create_directory`, `move_file`. So the server is
read-only in practice even though the package ships write tools.

**Used it:** headless run (see below) answered "list every route file and its
endpoints" using `mcp__docs__directory_tree` + `mcp__docs__read_text_file`. A
follow-up run that asked it to `write_file` was refused — the write tools are
not available.

## Skill

**Captured:** how a resource is built in this project — one router file per
resource exporting only the router, all state through `db/store.js`, validate in
the handler (`400` bad input / `404` missing / `201` on create), error bodies in
exactly `{ "error": "message" }`, mount in `server.js`, tests mirroring
`tests/users.test.js`, and an entry in `docs/api.md`.

**Wording so it fires:** the description names the concrete triggers — adding or
changing a file in `routes/`, wiring a router into `server.js`, adding
`db/store.js` helpers, writing endpoint validation/error responses — and gives
example prompts ("add a /projects resource", "add a DELETE /users/:id
endpoint"). Confirmed: the prompt *"I want to add a /projects resource to this
API"* loaded `express-resource` on its own, without the skill being named.

## Command

**Added:** `/review-conventions [path|staged]` — reviews the working-tree diff
(or a given path) against the project's convention checklist from `CLAUDE.md`,
then runs `npm run lint` and `npm test` and gives a ready / needs-changes
verdict.

**Worth a shortcut:** it's the exact pass done before every PR on this repo, it's
long to retype, and pinning the checklist keeps the review consistent no matter
who runs it.

## Hook

**`block-risky-bash.sh` — prevents, on `PreToolUse`, matcher `Bash`.** It reads
the proposed command and exits 2 (blocking it) when it matches a
history-rewriting or bulk-delete pattern: `rm -rf`, `git push --force` / `-f`,
`git reset --hard`, `git clean -f`. Chosen as `PreToolUse` because the point is
to stop the command before it runs, not react after. Confirmed: asking a run to
execute `git push --force origin ...` was blocked with the hook's message and
nothing was pushed.

## Headless run

```
claude -p "Use the 'docs' MCP filesystem server to list every file under routes/ \
  and, for each, the HTTP method + path of every endpoint it defines." \
  --allowedTools "mcp__docs__directory_tree,mcp__docs__read_text_file,\
mcp__docs__read_multiple_files,mcp__docs__search_files,mcp__docs__list_directory" \
  --mcp-config .mcp.json --strict-mcp-config
```

**Locked down:** only the five read-only `mcp__docs__*` tools were pre-approved —
no `Bash`, no native `Write`/`Edit`, no MCP write tools. The task is read-only
by nature, so that's all it can do; with nobody watching it cannot touch the
working tree or run shell commands.
