# NOTES

## 1. MCP server
Connected **Context7** (`npx -y @upstash/context7-mcp`) at project scope via `.mcp.json`. It resolves a library name to curated, version-accurate documentation instead of a guessed URL or stale training data — useful here because this repo pins Express `^4.19.2`, so answers about routing/error-handling conventions should reflect that exact API surface. It needs no credential for basic use, so nothing had to be kept out of `.mcp.json`.

The permission rule in `.claude/settings.json` allows exactly one tool: `mcp__context7__query-docs`. (Initial research suggested the tool would be named `resolve-library-id`/`get-library-docs`, per older Context7 docs — a headless run surfaced the real tool name for this installed version, and the rule was corrected to match.) Used it headless to pull Express's recommended catch-all-404 pattern, which also surfaced that this repo's own `server.js` has no such handler today (a possible follow-up, out of scope here).

## 2. Skill
`.claude/skills/add-rest-resource/SKILL.md` captures how a new resource is built in this repo, mirroring `users.js`: a router in `routes/`, matching functions in `db/store.js`, a test file in `tests/` following `users.test.js`'s style, and an entry in `docs/api.md` — plus the CLAUDE.md conventions (400/404, `{ "error": "message" }`) restated so the skill is self-contained. The description is written with an explicit exclusion ("Do not use for editing an existing route's logic, unrelated bug fixes, or non-API code") specifically so it doesn't fire on requests that merely touch a route file without scaffolding a new resource.

## 3. Command
`.claude/commands/check-conventions.md` — `/check-conventions [path]`. Unlike the skill (which *writes* new code), this *audits* existing code against CLAUDE.md's own checklist and reports violations with a fix suggestion each, or says so briefly if none are found. It's worth a shortcut because it's the kind of check worth running before every commit, not just when adding something new. Takes one free-form `$ARGUMENTS` value (a path, or nothing = current diff), since the input here is naturally a single field. Run once against `routes/users.js`: reported full compliance with no invented nitpicks, confirming the prompt does what was intended.

## 4. Hook
`.claude/settings.json` → `PreToolUse` on the `Bash` matcher, running `.claude/hooks/block-risky-bash.js`. **Prevent, not react** — a destructive command already run can't be undone, so it has to block before execution rather than clean up after. It denies (`exit 2`) a short set of risky patterns: `git push --force`/`-f`, `git reset --hard`, `rm -rf`, `git clean -f`, `--no-verify`.

Fired on purpose two ways: (1) piped a fake `git push --force` payload directly into the script — blocked, exit code 2; (2) created a throwaway `hook-test-tmp/` directory and had a fresh headless `claude -p` process (a fresh process is required, since hooks load at session start) try to `rm -rf` it — the hook blocked the command, the directory survived, and Claude asked a human to delete it instead. Cleaned up manually afterward.

## 5. Headless run
Task: *"List every route defined in `routes/*.js` and report which HTTP method+path combinations do NOT have a corresponding test in `tests/*.test.js`. Output as a short markdown table."*

Locked down to `--allowedTools "Read,Glob,Grep"` — no `Edit`, `Write`, or `Bash`, since this task only needs to inspect the repo and report; nothing it does can modify anything even if the prompt were misread.

Result: every route is tested except `GET /health`, which has no corresponding test in `tests/*.test.js`.
