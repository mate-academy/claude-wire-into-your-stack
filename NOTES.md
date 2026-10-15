# NOTES

## Server (MCP)

Connected the official **fetch** MCP server (`modelcontextprotocol/servers`, run via `uvx`) at project scope in `.mcp.json`. It's useful here because this is an Express API and Claude will regularly want to check current Express/Node reference docs while adding routes — a fetch tool beats relying on training-data memory of the API. It's credential-free, so nothing needed to go in the environment.

The permission rule in `.claude/settings.json` allows exactly `mcp__fetch__fetch` — the single read-only tool this server exposes — rather than blanket-trusting the server.

Two real problems came up wiring it in, both upstream, not project config: the npm package literally named `mcp-server-fetch` is an unrelated npx-confusion security-research canary (avoided it, used the real PyPI package via `uvx`); and that PyPI package's unpinned `mcp>=1.1.3` dependency resolves to `mcp` 2.0.0, which renamed `McpError` and breaks the server's import — pinned with `uvx --with "mcp<2.0.0"` to fix. I verified it live by fetching `https://expressjs.com/en/guide/routing.html`. Markdown/readability mode (`raw: false`) still fails — the `readabilipy` package's bundled `node_modules` has a broken jsdom/undici/webidl tree (reproduced identically on Node 16 and Node 20) — so I used `raw: true`, which works reliably.

## Skill

Captured **"how a route gets added to this repo"** — the pattern already followed by `routes/users.js`: store-first in `db/store.js`, one router file per resource, `400`/`404` validation in the handler, errors always shaped `{ "error": "message" }`, mounted in `server.js`, documented in `docs/api.md`, tested like `tests/users.test.js`.

The description names concrete trigger phrases ("add a `/products` resource", "add a DELETE endpoint for users") so it fires on real feature requests without the word "skill" ever being said. Confirmed by running a headless task asking for a new `/products` resource — it invoked the skill unprompted and produced a route file matching `routes/users.js` convention-for-convention.

## Command

Added **`/check-conventions`** — a review of the current branch's diff against this repo's route checklist (router pattern, store access, validation, error shape, docs, tests), citing `file:line` for anything off. Worth a shortcut because it's the exact review pass worth running before every commit/PR that touches `routes/`, and typing it out fresh each time invites skipping steps. Takes an optional `$ARGUMENTS` base ref (defaults to `main`). Ran it once against this branch — it correctly reported there were no route changes to check rather than inventing problems.

## Hook

A **`PostToolUse`** hook on the `Edit|Write` matcher, in `.claude/settings.json`, running `.claude/hooks/lint-fix.sh`. It reacts (not prevents) — after any `.js` file is touched, it runs `eslint --fix`, and if errors remain after fixing, exits `2` so Claude sees the lint output immediately instead of finding out at `npm run lint` or CI time. Chose react-after over block-before because lint fixes are safe to apply automatically; blocking the edit itself would just be friction.

Triggered it on purpose three times: a file with only a warning-level issue (no-unused-vars) — hook ran, stayed quiet, correct; a file referencing an undefined variable — hook fired and surfaced the exact `no-undef` error back to me; a clean file — no output, no false positive. Along the way it also caught that this checkout had never run `npm ci` (so lint was silently untestable) and that the default local Node (16.19.1, via `nvm`) is too old for this project's ESLint 9 (`structuredClone` needs Node ≥18.18) — the script now best-effort `nvm use 20` before linting.

## Headless

Ran a single scoped task headless: `claude -p "Додай новий ресурс /products до цього Express API..." --allowedTools "Read,Write,Edit,Glob,Grep"` — no `Bash`, so it could scaffold files but not run `npm ci`/tests/lint or touch git. This doubled as the skill-firing check. It correctly stopped and asked for permission when it wanted to run `npm ci`/`npm test`/`npm run lint`, proving the allowlist held. I discarded the resulting `/products` scaffold afterward since only the wiring itself — not app changes — belongs in this PR.
