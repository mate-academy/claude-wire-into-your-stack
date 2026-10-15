# Notes — wiring Claude into this project

The theme I kept coming back to: the four pieces below are committed, so they
are not *my* setup, they are *the project's* setup. Anyone who clones this repo
gets the same Claude. That is why each choice below is scoped narrowly rather
than broadly — a permission I grant here, I grant to everyone.

## The server

**`project-docs` — the filesystem MCP server, pointed at `./docs`.**

This repo keeps `docs/api.md` as the human-readable API reference, and it has to
stay in step with `routes/`. That is exactly the kind of thing that quietly
rots: someone adds a status code, nobody updates the docs, and the reference
slowly stops being true. Giving Claude direct read access to the docs folder
makes checking for that drift a normal part of working here.

I pointed it at `./docs` rather than the project root on purpose. A relative
path means it resolves correctly on a teammate's machine too, and limiting it
to one folder means the server cannot reach `.env`, `node_modules`, or anything
else outside the documentation.

**The permission rule** allows four read-only tools and nothing else:

```
mcp__project-docs__read_text_file
mcp__project-docs__list_directory
mcp__project-docs__search_files
mcp__project-docs__get_file_info
```

I also added an explicit `deny` list for the four write tools the server
exposes (`write_file`, `edit_file`, `create_directory`, `move_file`). The allow
list alone would already stop them running unprompted, so the deny list is
belt-and-braces — but it makes the intent legible to the next person reading
the file: this server reads, it does not write.

I confirmed it works by having it read `docs/api.md` over the protocol before
committing.

## The skill

**`add-api-route`** — the way an endpoint gets added to this API.

Reading the existing code, adding a route here is never one step. It is five,
and the last two are the ones that get dropped: the route file, mounting it in
`server.js`, a helper in `db/store.js`, the 400/404 validation with the
`{ "error": "message" }` shape, and then a supertest test *plus* an update to
`docs/api.md`. That chain lived in people's heads and half of it in `CLAUDE.md`.
The skill writes it down once, with real examples pulled from this repo.

On wording the description so it fires: my first instinct was something short
like "conventions for adding routes". That is too vague — it competes with
every other instruction. What made it reliable was naming the concrete triggers:
the HTTP methods by name, the `routes/` folder, and the words someone would
actually use ("new route", "new resource", "new endpoint"), plus the
adjacent case of changing how an existing endpoint validates or reports errors.
The description says what the request looks like, not just what the skill knows.

## The command

**`/api-review`** — review the working diff against this project's checklist.

This is the prompt I would otherwise retype before every pull request, and
retyping it means quietly dropping an item each time. Saving it makes the
review the same review every time, which is the whole value — a checklist you
remember 80% of is not a checklist.

It takes `$ARGUMENTS` as an optional path, so `/api-review routes/users.js`
narrows it and a bare `/api-review` reviews everything uncommitted. I also
scoped its `allowed-tools` to reads plus the specific commands it needs
(`git diff`, `git status`, `npm test`, `npm run lint`) — a review should not be
able to edit anything, and the last line of the prompt says so too.

## The hook

**`PostToolUse` on `Edit|Write` → `eslint --fix` on the changed file.**

This one **reacts** rather than prevents. That was the deliberate choice: lint
formatting is not dangerous, so blocking an edit over it (`PreToolUse`) would be
disproportionate and annoying. Letting the edit land and then tidying it is the
right shape for a standard that should hold without anyone thinking about it.

- **Event:** `PostToolUse` — react after the fact
- **Matcher:** `Edit|Write` — the two tools that change file contents
- **Command:** `node .claude/hooks/eslint-fix.js`

The repo already had ESLint configured and running in CI, but nothing enforcing
it while you work — so lint failures were only discovered after pushing. Now
they are fixed as they happen.

I put the logic in a real script rather than a one-liner in the JSON, because
it needs to do three things a one-liner does badly: read the hook payload from
stdin, skip anything that is not a `.js` file inside the project, and never
fail. It always exits `0` — a formatting pass that blocks your work is worse
than no formatting pass. I tested it by feeding it a `.js` payload (it ran) and
a `.md` payload (it correctly did nothing).

## The headless run

I ran the documentation drift check unattended:

```
claude -p "Compare docs/api.md against the actual routes in routes/. Report any
endpoint, HTTP status code, or request field that is documented but not
implemented, or implemented but not documented. Report only — do not change any
files." --allowedTools "Read,Grep,Glob"
```

**What I locked down:** `Read`, `Grep`, `Glob` — three read-only tools. No
`Edit`, no `Write`, no `Bash`. The reasoning is that the risk profile changes
completely when nobody is watching: with no human in the loop to catch a wrong
call, the safe move is to make the wrong call impossible rather than unlikely.
The task only needed to look at files, so nothing else was granted. `Bash` in
particular was worth withholding — it is the tool that could reach anything the
other three cannot.

It found four real things, which was more than I expected from a repo this
small: `POST` and `PUT` disagree about whether an empty string counts as a
missing field, `PUT` returns `400` before it ever checks for `404`, malformed
JSON escapes the documented `{ "error": "message" }` shape entirely because
there is no error-handling middleware, and non-numeric ids are undocumented.
None of those are what I would have thought to look for.

## One thing worth knowing on a fresh checkout

Both the MCP server and the permission rules stay inactive until someone runs
`claude` interactively in this folder once and accepts the trust dialog. That
is not a misconfiguration — it is the point. A committed `.mcp.json` can tell
Claude to run a command, so a repo you cloned should not be able to execute
anything before you have said yes. It surprised me at first, then it made sense:
the wiring travels with the repo, but the consent does not.
