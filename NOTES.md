# Notes

**Which server did you connect, why is it useful here, and what did your permission rule allow?**
Connected the `filesystem` MCP server. It's useful because it gives direct, tool-native read/write access to files in this repo (used it to read `docs/api.md` and list `.claude/`) without going through the built-in Read/Write tools. Its permission rule scopes it to allowed directories only — this project's checkout — so it can read and write within the repo but can't reach anywhere else on the machine.

**What repeated way of working did your skill capture, and how did you word the description so it fires?**
The `test-per-feature` skill captures this repo's 1:1 mirroring of `routes/<resource>.js` to `tests/<resource>.test.js`, using the same `node:test` + `supertest` + `store.reset()` pattern with one test per behavior (happy path, 400s, 404s). The description is written in third person with concrete trigger phrases — "add a route", "new feature", "new resource", "add an endpoint" — plus an explicit clause for changes under `routes/` or `db/store.js`, so it fires on the action (adding/extending a route) rather than only when someone says the word "test."

**What command did you add, and what makes it worth a shortcut?**
Added `/scaffold-route`, which takes just a resource name and scaffolds `routes/<name>.js` (GET/GET-by-id/POST/PUT following `routes/users.js`'s conventions), mounts it in `server.js`, and adds matching `db/store.js` helpers. It's worth a shortcut because that's the same boilerplate and set of decisions repeated every time a new resource is added — a one-word command replaces re-deriving the convention each time.

**What hook did you set — does it react or prevent, and on which event?**
Set three: two `PreToolUse` hooks on `Bash` that *prevent* — one asks for confirmation before destructive commands (`rm -rf`, `git clean -f`, `git reset --hard`, etc.), one denies `git commit`/`git push` outright if the staged diff looks like it contains a secret. The third is a `PostToolUse` hook on `Write|Edit` that *reacts* — it lints the touched file after the edit lands and blocks with the errors if it fails.

**What did you run headless, and what did you lock down?**
Ran a headless pass in CI (`claude -p "scan the diff for leftover TODO/FIXME comments and summarize them" --output-format json`) triggered on each PR push, which posts its summary as a PR comment. Locked it down with `--allowedTools Read,Grep,Glob` so the headless run is read-only — it can inspect the diff and repo but has no path to Edit, Write, or Bash, so it can't modify anything even if the prompt were manipulated.