---
description: List this project's documentation files with a one-line summary of each. Optionally scope the search to one directory with $1.
---

List the documentation under `$1` (search that directory and its
subdirectories). If `$1` is not given, search the whole project tree instead.
Look for Markdown files (`README.md`, `CLAUDE.md`, `docs/**/*.md`, etc.),
excluding `node_modules` and `.claude/`. For each file found, print its path
relative to the repo root and a one-line summary of what it covers (read
enough of the file to summarize it accurately — don't guess from the
filename). Present the result as a simple list, most important/entry-point
docs first (README before deeper reference docs). If `$1` was given and no
Markdown files are found under it, say so plainly instead of listing nothing.
