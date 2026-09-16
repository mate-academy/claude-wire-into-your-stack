---
description: Carry out checks before a PR is made - linter check and unit tests,
then write the PR description
allowed-tools: Read, Grep, Edit(README.md), Bash, Skill
---

 Have the Explore agent gather the files changed on the current branch, and run the lint and unit-tests subagents - all 3 in parallel. When both pass, use the pr-summarizer agent to draft the PR description.
