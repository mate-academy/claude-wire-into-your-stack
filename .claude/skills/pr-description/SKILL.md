---
name: pr-description
description: Writes a pull request description in a clear, consistent format (What Changed, Why, How to Test). Use when asked to write or draft a PR description, or when a PR is being created/updated and doesn't already have a description.
---

Write the pull request description using this exact structure, in this order:

## What Changed
One or two short bullet points summarizing the concrete changes (files, features, behavior). Keep each bullet to a single line where possible.

## Why
The reason the change was made — the problem it solves, the issue it fixes, or the motivation behind it. This is about intent, not a restatement of "What Changed."

## How to Test
Concrete, numbered or bulleted steps someone can follow to verify the change works — commands to run, endpoints to hit, expected results. Be specific enough that a reviewer with no other context could follow along.

## Process

1. Inspect the actual changes (`git diff`, `git log` against the base branch) rather than guessing — the description must reflect what really changed.
2. Draft the three sections above, in that order, using concise bullets rather than prose paragraphs.
3. If creating a new PR (`gh pr create`), pass this as the body. If updating an existing PR that has no description, use `gh pr edit --body` (or equivalent) to add it — don't overwrite an existing non-empty description without confirming first.
4. Keep the whole description skimmable: short bullets, no filler, no restating the diff line-by-line.
