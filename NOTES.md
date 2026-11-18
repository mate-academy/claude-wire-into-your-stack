# NOTES

## MCP server

I connected the `fetch` server (`@tokenizin/mcp-npx-fetch`) at project scope, so it is committed in `.mcp.json` and every teammate who clones the repo gets it. It needs no API key, so there is no secret to leak.
It lets Claude read current documentation (Express 4, supertest, the Node test runner) as Markdown while working on routes, instead of relying on memory.
The permission rule in `.claude/settings.json` allows only `mcp__fetch__fetch_markdown`, the one read-only tool I actually use. I did not allow the whole server (`mcp__fetch`), so `fetch_html`, `fetch_json` and `fetch_txt` still ask for approval.
I used it to load the Express 4.x API reference (`https://expressjs.com/en/4x/api.html`) and confirm that the 4.x API matches the `express@^4` version in `package.json`. One thing I noticed: the Markdown is not fully clean. The site's inline scripts and CSS also came through.

## Skill

The `error-responses` skill (`.claude/skills/error-responses/SKILL.md`) captures how routes in this project handle errors: validate input first and return `400`, return `404` when a record is missing, always `return` the error response, use the JSON shape `{ "error": "message" }`, and access data only through `db/store.js`.
The description says when to use it (adding or changing an Express route that reads client input or looks up a record) and when not to (routes that only return fixed data, like `/health`). That keeps it from firing on unrelated work.
To confirm that it fires, I asked "Add a DELETE /users/:id route" without naming the skill. Claude loaded `error-responses` on its own and wrote the route with a `404` for a missing user and `204` on success. After the test I reverted the route, because this project changes only how Claude works, not the app.

## Command

TODO: add after task 3.

## Hook

The hook prevents rather than reacts. It runs on the `PreToolUse` event with the matcher `Bash`, so it checks every shell command Claude is about to run in this project. The command is `.claude/hooks/block-rm-rf.sh`: it reads the tool input with `jq`, and when the command matches `rm -rf`, `rm -fr` or `rm -r -f`, it prints a reason to stderr and exits with `2`, which blocks the call.
It applies only to Claude's tool calls. Commands I type in my own terminal are not affected.
I triggered it on purpose by asking Claude to run `rm -rf /tmp/hook-test`. The call was blocked with "Blocked by project hook: 'rm -rf' is not allowed."
Limitations: the script needs `jq` installed, and it is a guard against accidents, not against deliberate bypasses like `find -delete` or `rm --recursive --force`.

## Headless run

TODO: add after task 5.
