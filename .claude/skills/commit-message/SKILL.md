---
name: commit-message
description: Use when writing a git commit message or committing changes in this repo (e.g. "commit this", "write a commit message", "commit and push"). Defines the project's commit message format, including summarizing key code changes. Not for PR descriptions or code comments.
---

# Commit message format

Use Conventional Commits:

    <type>(<scope>): <summary>

    <body: key code changes, and why>

## Subject line
- **type**: one of `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`
- **scope** (optional): the area touched, e.g. `users`, `health`, `store`, `claude`
- **summary**: imperative mood ("add", not "added"), lowercase, no trailing period, max 50 characters

## Body: include key code changes when needed
Add a body whenever the diff has changes a reviewer should know about. Skip it only for trivial changes (typos, one-line fixes).

List the key code changes as short bullets, naming the actual files, functions, or routes touched:
- new or changed routes, e.g. `PUT /users/:id`
- new or changed store helpers, e.g. `store.updateUser`
- changed behavior, status codes, or error responses
- new or updated tests and docs

Then add a line on **why** if it is not obvious from the changes. Wrap the body at 72 characters.

## Examples

    feat(users): add PUT /users/:id endpoint

    - routes/users.js: add PUT /:id, returns 400 if neither name nor
      email is given, 404 if the user is missing
    - db/store.js: add updateUser(id, fields)
    - tests/users.test.js: cover successful update and 404

    fix(store): return null for missing user id

    - db/store.js: getUser no longer throws on unknown ids, so routes
      can return their 404 response

    docs: document 404 error shape in api.md

## Rules
- One logical change per commit. If the diff mixes concerns, suggest splitting it.
- Base the message on what is actually staged: run `git diff --staged` first.
- Only list changes that are in the diff. Never invent or pad bullets.
