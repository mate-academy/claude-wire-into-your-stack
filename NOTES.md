# Notes — wiring Claude into this repo

Four integrations, chosen so each does a distinct job: the skill writes code, the command reviews it
on demand, the hook enforces one rule automatically, and the MCP server supplies facts none of them
have.

## The server

**Context7**, at project scope in `.mcp.json`, alongside the GitHub server.

Context7 is the one that earns its place here. This is an Express 4 app, and Context7 returns the
current Express docs instead of whatever a model remembers about them. I used it on a real task: while
checking `docs/api.md` against the routes, it returned the Express 4.21.2 error-handling middleware
pattern, which turned out to be exactly what `server.js` was missing — malformed JSON bodies were
falling through to Express's default handler and returning an HTML stack trace with absolute
filesystem paths. That became commit `3c967a2`.

The permission rule allows the two read-only tools and nothing else:

```
"allow": ["mcp__context7__resolve-library-id", "mcp__context7__query-docs"]
```

Both are reads, so documentation lookups never interrupt with a prompt, while anything else on either
server still asks. The `deny` list names four GitHub write and delete tools — the destructive ones I
never want reached by accident.

Neither secret is in the file: `${CONTEXT7_API_KEY}` and `${GITHUB_PERSONAL_ACCESS_TOKEN}` are
referenced and set in my environment.

*What I learned:* I briefly removed two deny rules believing the tools didn't exist, because their
names weren't in the tool list. The absence *was* the deny rule working — denied tools are filtered
out of what Claude can see. A deny rule is only visible by its effect, so the way to test one is to
change it and watch what appears.

## The skill

`.claude/skills/add-api-endpoint/SKILL.md` — the vertical slice this repo repeats for every resource:
store helper, router file, mounting, validation, supertest coverage, docs entry.

It's worth writing down because three of those steps are project-specific in ways a fresh session gets
wrong. Chiefly: a router mounted *below* `app.use(notFound)` is silently swallowed by the catch-all —
the endpoint 404s with no error, no failed import, and nothing in the logs. Also, new seed data has to
go in `seed()` because `reset()` is what isolates the tests, and the `lint` script enumerates
directories, so a new top-level directory goes unlinted.

On the description: I led with the concrete artifacts — `routes/`, `db/store.js`, "a new route file",
"DELETE /users/:id" — rather than the abstract idea of "how we add endpoints", so it matches the nouns
a real request actually contains. It also says what it does *not* cover (test-only changes, refactors)
so it doesn't fire on "write tests for X". It fired first try: a fresh session given `add a DELETE
/users/:id endpoint`, with the skill never named, invoked it as its first tool call, before reading
any file.

## The command

`.claude/commands/pr-ready.md` — reviews the diff against this project's eight-point checklist and
runs `npm test` and `npm run lint`.

It's worth a shortcut because I run it before every commit, and because CI only covers one of the
eight items. The other seven — mount order, state ownership, error shape, docs drift, lint directory
coverage, failure-path tests, leaked secrets — are exactly the things a green build still misses. It
takes an optional git ref via `$ARGUMENTS` and defaults to uncommitted changes plus unpushed commits.
`allowed-tools` is scoped to read-only git plus the two npm scripts, so a review can't mutate the repo.

I checked that it can actually fail, not just pass: I mounted a router below `notFound` on purpose and
it failed that item with the right file and line, plus the two knock-on failures.

*What I learned:* my first version had `!`git log … 2>/dev/null || echo "…"`` as a context line, and
the command expanded to nothing — zero turns, zero tokens, no error at all. Bisecting showed the `||`
is what breaks it; the redirect alone is fine. `!` injections in slash commands don't tolerate shell
control operators, and they fail silently.

## The hook

`PostToolUse` on `Edit|Write`, running ESLint on the edited `.js` file. It **reacts** rather than
prevents.

`PostToolUse` because ESLint needs the file on disk to judge it — `PreToolUse` only sees proposed
input. The standard it holds is the one CI already gates on, moved from minutes after a push to
seconds after the edit; and because a failing `PostToolUse` hook feeds its stderr back to the model,
the violation gets fixed in the same turn rather than in a later one. The command guards on a
non-empty path and a `.js` file under `$CLAUDE_PROJECT_DIR`, so JS edited elsewhere on disk isn't
judged against this repo's config. There is deliberately no `|| true` — swallowing the exit code would
make the hook decorative.

Verified live: I edited `routes/health.js` to reference an undefined variable and the hook blocked with
`7:61 error 'definitelyNotDefined' is not defined no-undef`. Reverting passed cleanly, so it
discriminates rather than always firing.

*What I learned:* my first test used an unused variable and the hook let it through. `no-unused-vars`
is set to `warn` here, and ESLint exits 0 on warnings — so neither the hook nor CI blocks on warnings.
I kept that parity rather than adding `--max-warnings 0`, since a hook stricter than CI would block
work the PR would accept.

## The headless run

Adding `DELETE /users/:id` — the real gap in the users resource, which had everything but delete.

```
claude -p "add a DELETE /users/:id endpoint" \
  --allowedTools Read Edit "Bash(npm test)" "Bash(npm run lint)"
```

`Read` and `Edit` because it changes four existing files. The two npm scripts so it can verify its own
work. What I locked down matters more:

- **`Write`** — the task adds no new file, so withholding it makes a stray file impossible rather than
  unlikely.
- **`Bash` generally** — only those two exact scripts, so no arbitrary shell.
- **`Bash(git *)`** — specifically so the diff had to come back to a human. Reviewing it is the whole
  point of running unattended.

The run used the skill unprompted as its first tool call, made five edits, and ended with
`npm test && npm run lint`. `permission_denials` was empty, and no `Write` or `git` appears anywhere in
the transcript.

I tested the scoping in both directions. First I ran the same prompt with `Edit` withheld: five
denials, working tree unchanged. Only then the real run. An allowlist that has never refused anything
is untested — zero denials only means "right-sized" if you've also seen it refuse. Afterwards I read
the diff line by line, ran the suite myself, exercised the endpoint against a live server
(`204`, then `404` on a repeat delete), and ran `/pr-ready` over the result: 8 of 8.
