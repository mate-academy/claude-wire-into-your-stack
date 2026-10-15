# NOTES

**MCP server.** Connected the official 
`@modelcontextprotocol/server-filesystem` server (`docs` in `.mcp.json`), 
pointed at the `docs/` folder. It's useful here because it lets Claude 
reference the project's own API documentation while writing or reviewing 
routes, without needing any credentials. The permission rule in 
`.claude/settings.json` allows only its read-only tools (`read_file`, 
`read_multiple_files`, `list_directory`, `directory_tree`, `search_files`, 
`get_file_info`, `list_allowed_directories`) — `write_file`, `edit_file`, 
`move_file`, and `create_directory` are deliberately left out, since 
Claude should never write through this server, only read. Verified by 
asking it to summarize `docs/api.md`, and again when the skill below used 
it to check docs before editing them.

**Skill.** `add-express-route` captures this repo's repeated pattern for 
adding a resource route: an `express.Router()` file under `routes/`, 
mounted in `server.js` the same way as the existing routes, `{ error: 
"message" }` for 400/404s, no state held outside `db/store.js`, and a 
matching `tests/<resource>.test.js` using `node:test` + `supertest`. The 
description is worded to fire specifically on requests to 
add/create/scaffold a new route or endpoint, and explicitly excludes edits 
to existing routes or general Express questions, so it doesn't fire on 
unrelated work. Verified: asked (without naming the skill) to "add a new 
GET /api/ping endpoint," and it loaded the skill automatically and 
reproduced the pattern exactly.

**Command.** `/review-changes [base-branch]` diffs the current branch 
against a base (defaults to `main` via `$ARGUMENTS`) and checks it against 
the project's checklist: lint passes, tests pass, the `{ error: "message" 
}` shape is respected, and `docs/api.md` is updated when routes change. 
It's worth a shortcut because it's exactly the check I'd otherwise run by 
hand before every PR — one command instead of four separate steps. 
Verified by running `/review-changes main` against the `/api/ping` commit; 
it ran the real checks and reported a clean pass.

**Hook.** A `PostToolUse` hook (project scope, `.claude/settings.json`) 
matching `Edit|Write` that runs `npx eslint --fix` on any `.js` file just 
touched, reading the file path out of the hook's stdin JSON via `jq`. This 
is a "react" hook — it lets the edit happen, then corrects style after the 
fact, rather than blocking anything up front. The repo's original 
`eslint.config.js` (just `js.configs.recommended`) had no autofixable 
style rules to demonstrate this against, so I added 
`@stylistic/eslint-plugin` with `quotes: single` and `semi: always` — a 
reasonable real standard for the hook to enforce, matching the style 
already used throughout the repo. Verified by deliberately writing 
double-quoted JSON into a route and watching the hook convert it back to 
single quotes without touching it myself.

**Headless run.** Ran a well-scoped task via `claude -p` to add a `GET 
/api/version` endpoint (reading the version from `package.json`) using the 
`add-express-route` skill's pattern, then run the test suite. Locked down 
with `--allowedTools "Read,Write,Edit,Bash(npm test:*),Bash(npm run 
lint:*)"` — enough to read/write repo files and run only the test and lint 
scripts, but no `git` and no unrestricted `Bash`, so it can make and 
verify a real code change without being able to commit, push, or run 
anything outside the npm scripts it needs. It passed lint and all 7 tests 
(including its own new test) on the first run.
