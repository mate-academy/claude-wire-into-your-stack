---
name: code-simplifier
description: Simplify recently changed code without changing its behavior. Use when the user asks to simplify, clean up, tidy, or refactor recent changes, a diff, or the last commit.
---

# Code Simplifier

Simplify recently changed code so it is easier to read and maintain. Behavior must stay exactly the same.

## 1. Find the recent changes

Pick the first of these that has changes:

1. Uncommitted work: `git diff HEAD` (and `git status` for new untracked files)
2. The last commit: `git show HEAD`
3. If the user named files, a range, or a commit, use that instead

Only touch code that appears in that diff. Do not wander into unrelated files.

## 2. Establish a baseline

Run `npm test` and `npm run lint` before editing. If either already fails, tell the user and stop. You can't prove behavior is unchanged from a broken baseline.

## 3. Simplify

Look for:

- Dead code, unused variables, imports, and parameters
- Duplicated logic that can share one helper, or an existing helper in the codebase
- Deeply nested conditionals that can use early returns or guard clauses
- Needlessly clever or verbose expressions that have a plainer equivalent
- Unclear names, and comments that restate the code
- Needless intermediate state or wrapper functions

Follow the project conventions in CLAUDE.md:

- One route file per resource
- All data access goes through `db/store.js`
- Input validation in the route, with `400` for bad input and `404` for missing records
- Error responses shaped as `{ "error": "message" }`

## 4. Hard rules

- No behavior changes. Same inputs give the same outputs, status codes, response bodies, and side effects.
- Do not change public interfaces: routes, response shapes, exported function signatures.
- Do not add features, fix bugs, or change error messages. If you spot a bug, report it and leave it alone.
- Do not make the code shorter at the cost of clarity. Dense one-liners and nested ternaries are not simpler.
- Match the surrounding style. Do not reformat code you are not changing.
- If a change is not clearly safe, skip it and mention it.

## 5. Verify

Re-run `npm test` and `npm run lint`. Both must pass as they did at baseline. If anything breaks, revert that edit.

## 6. Report

Give a short summary: what you simplified and why, anything you skipped, and any bugs or concerns you noticed but left alone. Do not commit unless asked.
