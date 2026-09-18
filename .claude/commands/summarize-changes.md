---
description: Summarize the project's uncommitted changes in plain language, grouped by category
argument-hint: [ref]
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git ls-files:*), Read
---

Summarize everything that has changed in this project, for a reader who wants to
understand what the work accomplished without reading a diff.

## What to compare against

Use `$1` as the comparison target. If it is empty, use `HEAD` — the last commit on the
current branch.

Say which target was used in the first line of your output, so the reader always knows
what the summary is measured against.

If the target does not resolve to a real commit or branch, say so plainly and stop.
Do not fall back to summarizing nothing as though there were no changes.

## Gathering the changes

Run all four steps. Steps 1 and 3 each find things the other misses entirely.

1. **Tracked changes** — `git diff <target> --stat` for the shape, then
   `git diff <target>` for the content. Comparing the working tree against the target
   picks up staged and unstaged work together, and when the target is a branch name it
   also picks up whatever is already committed on the current branch.

2. **Working tree state** — `git status --short`, to see what is staged versus not and to
   catch renames and deletions.

3. **Untracked files** — `git ls-files --others --exclude-standard`, then `Read` each one
   it lists.

   **Never skip this step.** New files that have not been added to git produce *no diff
   at all*, so step 1 cannot see them. They are frequently the largest part of the work,
   and a summary that omits them is worse than no summary — it looks complete while
   missing most of the change.

   Keep `--exclude-standard`. It honors `.gitignore`, which is what keeps local
   environment files and the credentials in them out of the summary.

4. **Commits** — only when the target is something other than `HEAD`:
   `git log --oneline <target>..HEAD`.

## Writing the summary

Open with one sentence describing the change set as a whole. Then the sections below,
in this order, **leaving out entirely any section with nothing in it** — do not write a
heading followed by "none".

- **Source code** — `server.js`, `routes/`, `db/`
- **Tests** — `tests/`
- **Documentation** — `README.md`, `CLAUDE.md`, `docs/`
- **Configuration** — `.mcp.json`, `.claude/`, `eslint.config.js`, `.github/`, `.gitignore`
- **Dependencies** — `package.json`, `package-lock.json`
- **Other** — anything that fits nowhere above

### Style

The purpose is to inform, so write for someone who knows the project but has not seen
this work.

- **Plain language.** Use a technical term only where there is no plain equivalent.
  Write "a new endpoint for deleting users" rather than "a new DELETE route handler with
  a 404 branch".
- **Say what the change accomplishes**, not which lines moved. "Routes now reject
  requests missing a name" beats "added an if statement to the POST handler".
- **Be brief.** One or two sentences per item. The whole summary should be readable in
  under a minute.
- **Name the files** so anything can be traced back, but never paste diffs or quote code.
- Treat `package-lock.json` as a single line item — "dependency lockfile updated". Never
  read it or describe its contents.
- If nothing has changed, say exactly that in one line and stop.
- **Never print a secret.** If a changed file contains a key, token or password, name the
  file and note that it holds a credential — nothing more.
