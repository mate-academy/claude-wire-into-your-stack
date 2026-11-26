---
description: Review the current branch against this project's conventions and report violations (read-only)
argument-hint: "[base-ref, default: main]"
allowed-tools: Read, Grep, Glob
disable-model-invocation: true
---

Review the changes on the current branch against the base ref `$ARGUMENTS`.
If that is empty, use `main`.

1. Run `git log --oneline <base>..HEAD` and `git diff <base>...HEAD` to see
   what changed. Also run `git status --short` and mention uncommitted
   changes, but review only committed work.
2. Read `CLAUDE.md` and `.claude/skills/add-endpoint/SKILL.md`. Together
   they are the checklist; do not invent rules beyond them.
3. Check every changed file against every rule in those two files. Read
   surrounding code where the diff alone is not enough to judge.

Do not edit any files. Report in this format:

**Verdict:** ready / needs changes

**Findings**, most severe first, each as
`path:line` — what violates which rule — the concrete fix.

If nothing violates the checklist, say so in one line. Leave out praise and
style remarks that no rule covers.
