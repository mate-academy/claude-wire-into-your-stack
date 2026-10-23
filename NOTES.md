## Which server did I connect, why is it useful here, and what does my permission rule allow?

I connected the fetch server (`uvx mcp-server-fetch`) at project scope in `.mcp.json`. It needs no account or key, and it lets Claude read web pages such as the Express docs. It overlaps with Claude's built-in WebFetch, but I wrote it into the repo so teammates get it too. The permission rule in `.claude/settings.json` allows only `mcp__fetch__fetch`, not the whole server. I used it once to read the Express docs for `res.status` and compare them with `routes/users.js`.

## What repeated way of working did my skill capture, and how did I word the description so it fires?

My skill `add-resource` captures the steps for adding a new resource: store functions, router, mounting in `server.js`, tests, `docs/api.md`, then `npm test` and `npm run lint`. I worded the description as "Use when asked to add a new resource, endpoint or route to this Express API." It fired: I asked for a `/products` resource without naming the skill, and Claude said it used `add-resource`.

## What command did I add, and what makes it worth a shortcut?

I added `/check-api`, which reviews the branch's changes, or one file if I pass it as `$ARGUMENTS`, against the rules in `CLAUDE.md` (400 on bad input, 404 on a missing record, the `{"error":"message"}` shape, data only through `db/store.js`, tests, docs). It never edits files. It is worth a shortcut because it gives the same checklist every time, for everyone on the team.

## What hook did I set — does it react or prevent, and on which event?

I set a `PostToolUse` hook with matcher `Edit|Write` that runs `npm run lint`. It reacts rather than prevents: the edit is already saved when it runs, and exit code 2 only feeds the error back to Claude. I watched it fire when I added `undefinedThing()`, which is a `no-undef` error. An unused variable is only a warning, so it did not fire.

## What did I run headless, and what did I lock down?

I ran `claude -p` with `--allowedTools "Read,Grep,Glob"` and `--max-budget-usd 0.50`, asking it to list routes missing from `docs/api.md`. I locked down editing and running commands, because the job only needs to read. The result: nothing was missing.
