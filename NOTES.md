# Notes — wiring Claude into this project

## MCP server

`context7`, configured in `.mcp.json` at project scope so everyone working on
this repo gets the same server. It fetches current library documentation on
demand, which matters here because this project's behaviour depends on details
that shift between major versions — the difference between Express 4 and 5
handling of `req.body` caused a real mistake during this work, and looking it up
beats trusting recall.

The permission rule in `.claude/settings.json` allows exactly two tools:
`mcp__context7__resolve-library-id` and `mcp__context7__query-docs`. Both are
read-only lookups, so documentation checks never interrupt with a prompt, and
nothing in the allowlist can write anything.

## Skill — `api-endpoint`

The repeated shape it captures is that **an endpoint here is never just a
route**. Every one touches the same five places: a `db/store.js` helper, the
route file, a mount in `server.js` for new resources, tests, and an entry in
`docs/api.md`. It also pins the house style — validate before lookup, ids via
`Number(req.params.id)`, and the `{ error: message }` shape with its casing
split, where 400s are lowercase field requirements and 404s are capitalised
sentences.

The description fires because it is concrete rather than thematic: it names the
actual paths (`routes/`, `db/store.js`, `docs/api.md`), gives example phrasings
a request would really use ("add DELETE /users/:id", "add a projects resource"),
and ends with an explicit exclusion so it stays quiet on general Express
questions. Tested with a fresh agent given the task in plain language and no
mention of the skill — it invoked the skill as its first action, before reading
any file.

## Command — `/api-review [ref or path]`

Reviews changed code against this project's conventions and reports what broke,
what's missing, and what was already wrong. It complements the skill rather than
repeating it: the skill covers writing an endpoint, the command checks one
already written.

It earns a shortcut because the checklist is long, exacting, and its most common
failure is silent — forgetting the `docs/api.md` entry or a test for one status
code leaves everything passing and looking finished. Typing that out each time
means eventually typing a shorter version of it. Three trial runs tightened the
saved prompt, and the dependency rule added along the way immediately caught a
real defect: a guard justified by Express 5 behaviour in a project running
Express 4.22.2, whose tests passed for a different reason than their names
claimed.

## Hook — lint on edit

`PostToolUse` on an `Edit|Write` matcher, running `.claude/hooks/eslint-fix.js`.

It **reacts** rather than prevents, and that choice follows from the event:
before the tool runs there is no new content to lint, so `PreToolUse` could not
do this job at all. The script runs ESLint over the file just edited and exits 2
with anything it could not fix, which feeds the problem back on the edit that
caused it instead of at the end of the task. It uses ESLint's Node API rather
than a shell one-liner because `jq` is not installed on every machine this repo
is used from and the checkout path contains spaces.

## Headless run

Closed two gaps the review found — the 404 tests asserted only `res.status`, so
a handler returning 404 with the wrong body would still have passed.

```
claude -p "<task>" --allowedTools "Read,Edit,Bash(npm test*)"
```

`Read` to see the file, `Edit` to change it, and one scoped shell command so it
could verify itself. What was withheld matters more: no `Write`, so it cannot
create files; no `Grep`/`Glob`, because the prompt named the exact file; no
network; and no git access at all, so it edits while review and commit stay
manual. In headless mode nothing outside the allowlist can prompt for approval,
so that list is the entire safety boundary — which is the argument for granting
the narrowest set that still finishes the job.
