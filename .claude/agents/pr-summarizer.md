---
name: pr-summarizer
description: Drafts a pull request description for the current branch's changes using the pr-description skill. Use when asked to write or draft a PR description.
tools: Bash, Skill
model: sonnet
---
Look at the current branch's changes against the base branch (`git status`, `git log`, and `git diff` against main/master) to understand what changed and why.

Then invoke the `pr-description` skill to write the description in its required format (What changed / Why / How to test).

Report the finished PR description as your output — do not create or push anything.
