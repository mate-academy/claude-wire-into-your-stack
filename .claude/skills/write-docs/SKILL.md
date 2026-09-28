---
name: write-docs
description: Write or update Markdown documentation for this Course API project using Claude Code's built-in file tools. Use this whenever the user asks to write, create, generate, or update a documentation/README/guide file for this project — even if they just say "document X" or "write up how Y works" without naming a tool.
---

# Writing docs

When the user asks for documentation to be written, use the built-in `Write`
tool to create it (and `Read`/`Edit` when updating an existing doc).

## Where docs live

This project keeps documentation under `docs/` as Markdown files. The only
exceptions are `README.md` and `CLAUDE.md` at the repo root. Before writing,
decide the target path:

- A new or updated doc about the API, a feature, or how something works →
  `docs/<topic>.md`
- Never write a `.md` file anywhere else in the tree (see `docs/api.md` for
  an example of the existing layout).

## Steps

1. Work out the content first — read whatever source files are relevant
   (routes, `db/store.js`, `CLAUDE.md`) so the doc reflects the actual
   current behavior rather than a guess.
2. Call `Write` with the absolute path to the target file, e.g.
   `<project>/docs/todos.md`, and the full Markdown content.
3. Confirm the path you wrote to back to the user (e.g. "Wrote
   `docs/todos.md`").

## Notes

- Match the plain, concise style of `docs/api.md`: short sections, code
  blocks for requests/responses, no filler.
- If the user's request implies updating an existing doc, read it first
  with `Read`, then use `Edit` for targeted changes or `Write` for a full
  rewrite, so the result preserves anything still accurate.