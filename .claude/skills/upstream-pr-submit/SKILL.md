---
name: upstream-pr-submit
description: Use when creating, opening, or submitting a pull request for this repository (e.g. "create a PR", "open a pull request", "submit this branch") — this repo is a course fork, and the default `gh pr create` targets this fork's own main instead of the upstream course repo that actually gets reviewed.
---

This repository is a fork of a course repo. Submissions are reviewed on the **upstream/original** repository, not on this fork — so a PR opened with the default target is invisible to the reviewer.

Before opening a PR here:

1. Confirm the fork relationship: `gh repo view --json isFork,parent,owner,name`.
2. If `isFork` is true, the PR must target `parent.owner.login/parent.name` on its `main` branch — not this fork's own `main`.
3. Push the branch to `origin` (this fork) as usual, then open the PR against upstream:
   `gh pr create --repo <parent-owner>/<parent-name> --base main --head <fork-owner>:<branch-name> --title "..." --body "..."`
4. Never create the PR without `--repo`/`--base` pointed at the parent — that opens it against the fork's own main and it won't be reviewed.
