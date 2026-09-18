# Notes

## MCP server

I connected **Context7** in `.mcp.json` as a remote HTTP server, and approved it for the whole project in `.claude/settings.json`. It is useful here because it fetches current documentation for libraries like Express, supertest and ESLint, instead of relying on what the model remembers. The permission rule allows exactly two of its tools, `resolve-library-id` and `query-docs`. Both are read-only lookups, so Claude can consult the docs without prompting each time. The API key is not committed: `.mcp.json` reads it from an environment variable.

## Skill

The `add-endpoint` skill captures the routine for adding an endpoint to an existing resource. It always takes four pieces that must land together: the route handler, the store method behind it, the tests, and the hand-maintained `docs/api.md` entry. It finishes by running `npm run lint && npm test`, the same checks CI runs. The description opens with "Use when adding an HTTP endpoint to a resource that already exists in this Express API". It then lists example phrasings ("add a DELETE /users/:id", "add a GET filter to users") and says what the skill covers. That lets it match both a precise request and a loosely worded one.

## Command

`/summarize-changes [ref]` writes a plain-language summary of what has changed, grouped into source, tests, docs, config and dependencies. It compares against `HEAD` by default, or against any branch or commit you pass. It is worth a shortcut because the job is several git commands in a fixed order, and it includes a step people forget: reading untracked files, which `git diff` cannot see. Its allowed tools are limited to read-only git commands and file reads.

## Hook

A **`PostToolUse`** hook on `Edit|Write` runs Prettier on whichever file Claude just changed. It **reacts** rather than prevents: the edit has already happened, and the hook tidies it afterwards. It never blocks anything, and if Prettier fails the edit still stands. A `.prettierrc` with `singleQuote` keeps Prettier's output matching the existing code style.

## Headless run

I ran `/summarize-changes` non-interactively from the repo root with `claude -p "/summarize-changes"`, and it printed a full summary of the branch without anyone at the keyboard. To lock it down, I passed `--allowedTools` with only `git status`, `git diff`, `git log`, `git ls-files` and `Read`, plus `--max-turns 15` as a cap. With nobody there to approve prompts, anything outside that list is denied. That means the run could describe the changes but not edit files or run other shell commands. It is a simple first step toward running the same summary in CI on pull requests.
