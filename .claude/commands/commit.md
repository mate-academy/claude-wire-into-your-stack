---
description: Commit the current code changes with a clear commit message
argument-hint: [optional message or hint]
allowed-tools: Bash(git branch --show-current), Bash(git switch -c:*), Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*), Bash(npm test:*), Bash(npm run lint:*)
---

## Context

- Branch: !`git branch --show-current`
- Status: !`git status --short`
- Changes: !`git diff HEAD`
- Recent commits (for message style): !`git log --oneline -5`

## Task

Commit the current changes.

1. If there are no changes, say so and stop.
2. If the current branch is `main`, create a new branch with a short descriptive name before committing.
3. Run `npm test` and `npm run lint`. If either fails, report the failure and stop. Do not commit.
4. Stage only the relevant files by name. Don't use `git add -A`, and don't stage secrets such as `.env` files.
5. Write a commit message that matches the style of the recent commits:
   - A short imperative subject line, 72 characters or fewer
   - A body only if the change needs explaining, covering why rather than what
   - If the user passed arguments, use them as the message or as a hint: $ARGUMENTS
6. End the message with this line, after a blank line:
   `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`
7. Commit with `git commit`. Never use `--no-verify` or amend existing commits.
8. Don't push. Show the resulting commit hash and subject.

If the changes cover several unrelated concerns, split them into separate commits.
